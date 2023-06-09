import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Post, PostVote, postState } from "../atoms/postAtom";
import { auth, firestore, storage } from "../firebase/clientApp";
import { deleteObject, ref } from "firebase/storage";
import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	where,
	writeBatch,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { communityState } from "../atoms/communitiesAtom";
import { authModalState } from "../atoms/authModalAtom";
import { useRouter } from "next/router";

const usePosts = () => {
	const [user] = useAuthState(auth);
	const router = useRouter();
	const [postStateValue, setPostStateValue] = useRecoilState(postState);
	const currentCommunity = useRecoilValue(communityState).currentCommunity;
	const setAuthModalState = useSetRecoilState(authModalState);

	const onVote = async (
		event: React.MouseEvent<SVGElement, MouseEvent>,
		post: Post,
		vote: number,
		communityId: string
	) => {
		event.stopPropagation();

		if (!user?.uid) {
			setAuthModalState({ open: true, view: "login" });
			return;
		}
		try {
			const { voteStatus } = post;
			const existingVote = postStateValue.postVotes.find(
				(vote) => vote.postId === post.id
			);

			const batch = writeBatch(firestore);
			const updatedPost = { ...post };
			const updatedPosts = [...postStateValue.posts];
			let updatedPostVotes = [...postStateValue.postVotes];
			let voteChange = vote;

			if (!existingVote) {
				//create a new postVote document
				const postVoteRef = doc(
					collection(firestore, "users", `${user?.uid}/postVotes`)
				);

				const newVote: PostVote = {
					id: postVoteRef.id,
					postId: post.id!,
					communityId,
					voteValue: vote, // 1 or -1
				};

				batch.set(postVoteRef, newVote);

				//add or subtract post.voteStatus
				updatedPost.voteStatus = voteStatus + vote;
				updatedPostVotes = [...updatedPostVotes, newVote];
			}
			//Existing vote - they have voted on the post before
			else {
				const postVoteRef = doc(
					firestore,
					"users",
					`${user?.uid}/postVotes/${existingVote.id}`
				);

				//Removing the vote (up => neutral || down => neutral)
				if (existingVote.voteValue === vote) {
					// add/ subtract 1 to/from post.voteStatus
					//removing the vote from the postVotes array
					updatedPost.voteStatus = voteStatus - vote;
					updatedPostVotes = updatedPostVotes.filter(
						(vote) => vote.id !== existingVote.id
					);

					// delete the postVote document
					batch.delete(postVoteRef);

					voteChange *= -1;
				}
				//Fliping the vote (up => down || down => up)
				else {
					// add/subtract 2 to/from post.voteStatus
					updatedPost.voteStatus = voteStatus + 2 * vote;
					const voteIndex = postStateValue.postVotes.findIndex(
						(vote) => vote.id === existingVote.id
					);

					updatedPostVotes[voteIndex] = {
						...existingVote,
						voteValue: vote,
					};
					// updating the existing postVote document
					batch.update(postVoteRef, {
						voteValue: vote,
					});

					voteChange = 2 * vote;
				}
			}

			//update the state with updated values
			const postIndex = postStateValue.posts.findIndex(
				(item) => item.id === post.id
			);
			updatedPosts[postIndex] = updatedPost;
			setPostStateValue((prev) => ({
				...prev,
				posts: updatedPosts,
				postVotes: updatedPostVotes,
			}));

			if (postStateValue.selectedPost) {
				setPostStateValue((prev) => ({
					...prev,
					selectedPost: updatedPost,
				}));
			}

			const postRef = doc(firestore, "posts", post.id!);
			batch.update(postRef, { voteStatus: voteStatus + voteChange });

			await batch.commit();
		} catch (error: any) {
			console.log("onVote error", error.message);
		}
	};

	const onSelectPost = (post: Post) => {
		setPostStateValue((prev) => ({
			...prev,
			selectedPost: post,
		}));
		router.push(`/r/${post.communityId}/comments/${post.id}`);
	};

	const onDeletePost = async (post: Post): Promise<boolean> => {
		try {
			//Check if there is image associated with the post, delete if exists
			if (post.imageUrl) {
				const imageRef = ref(storage, `posts/${post.id}/image`);
				await deleteObject(imageRef);
			}

			//delete post document from firestore
			const postDocRef = doc(firestore, "posts", post.id!); // bang operator to reassure TypeScript
			await deleteDoc(postDocRef);

			//update recoil state
			setPostStateValue((prev) => ({
				...prev,
				posts: prev.posts.filter((item) => item.id !== post.id),
			}));

			return true;
		} catch (error: any) {
			return false;
		}
	};

	//gets the user's postVotes for the current community
	const getCommunityPostVotes = async (communityId: string) => {
		const postVotesQuery = query(
			collection(firestore, "users", `${user?.uid}/postVotes`),
			where("communityId", "==", communityId)
		);
		const postVoteDocs = await getDocs(postVotesQuery);

		const postVotes = postVoteDocs.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		setPostStateValue((prev) => ({
			...prev,
			postVotes: postVotes as PostVote[],
		}));
	};

	useEffect(() => {
		if (!user || !currentCommunity?.id) return;
		getCommunityPostVotes(currentCommunity?.id);
	}, [user, currentCommunity]);

	useEffect(() => {
		if (!user) {
			// Clear user post votes when user logouts
			setPostStateValue((prev) => ({
				...prev,
				postVotes: [],
			}));
		}
	}, [user]);

	return {
		postStateValue,
		setPostStateValue,
		onVote,
		onSelectPost,
		onDeletePost,
	};
};
export default usePosts;

// we are making this custom Hook because we have to use these posts functions across multiple
// components and pages
