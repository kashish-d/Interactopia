import React, { useEffect, useState } from "react";
import {
	Community,
	CommunitySnippet,
	communityState,
} from "../atoms/communitiesAtom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/clientApp";
import {
	getDocs,
	collection,
	writeBatch,
	doc,
	increment,
	getDoc,
} from "firebase/firestore";
import { authModalState } from "../atoms/authModalAtom";
import { useRouter } from "next/router";

const useCommunityData = () => {
	const [user] = useAuthState(auth);
	const router = useRouter();
	const [communityStateValue, setCommunityStateValue] =
		useRecoilState(communityState);
	const setAuthModalState = useSetRecoilState(authModalState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const onJoinOrLeaveCommunity = (
		communityData: Community,
		isJoined: boolean
	) => {
		// is the user signed in?
		//if not => open auth modal
		if (!user) {
			//open modal
			setAuthModalState({ open: true, view: "login" });
			return;
		}

		setLoading(true);
		if (isJoined) {
			leaveCommunity(communityData.id);
			return;
		}
		joinCommunity(communityData);
	};

	const getMySnippet = async () => {
		// setError("")
		setLoading(true);
		try {
			//get user snippets
			const snippetDocs = await getDocs(
				collection(firestore, `users/${user?.uid}/communitySnippets`)
			);
			//Here we are getting an array of objects of commmunitySnippets of a particular user
			const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: snippets as CommunitySnippet[], //snippets is an array of CommunitySnippet type
				snippetsFetched: true,
			}));
		} catch (error: any) {
			console.log("getMySnippets error", error);
			setError(error.message);
		}
		setLoading(false);
	};

	const joinCommunity = async (communityData: Community) => {
		//batch write
		//if user leaves and joins community created by him, is he/she still the moderator?

		try {
			const batch = writeBatch(firestore);

			//create a community Snippets
			const newSnippet: CommunitySnippet = {
				communityId: communityData.id,
				imageUrl: communityData.imageUrl || "",
				isModerator: communityData.creatorId === user?.uid,
			};

			//updating the communitySnippets of the current user
			batch.set(
				doc(
					firestore,
					`users/${user?.uid}/communitySnippets`,
					communityData.id
				),
				newSnippet
			);
			//update the number of community members
			batch.update(doc(firestore, "communities", communityData.id), {
				numberOfMembers: increment(1),
			});
			await batch.commit();
			//update recoil state - communityState.mySnippets
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: [...prev.mySnippets, newSnippet],
			}));
		} catch (error: any) {
			console.log("joinCommunity error", error.message);
			setError(error.message);
		}
		setLoading(false);
	};

	const leaveCommunity = async (communityId: string) => {
		//batch write
		// delete the commmunity snippet from user
		// update the number of community members/ decrement by 1
		//update the recoil state - communityState.mySnippets
		try {
			const batch = writeBatch(firestore);
			batch.delete(
				doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
			);
			batch.update(doc(firestore, "communities", communityId), {
				numberOfMembers: increment(-1), //firestore does not have decrement method so -1
			});

			await batch.commit();

			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: prev.mySnippets.filter(
					(item) => item.communityId !== communityId
				),
			}));
		} catch (error: any) {
			console.log("leaveCommunity error", error.message);
			setError(error.message);
		}
		setLoading(false);
	};

	const getCommunityData = async (communityId: string) => {
		try {
			const communityDocRef = doc(firestore, "communities", communityId);
			const communityDoc = await getDoc(communityDocRef);
			setCommunityStateValue((prev) => ({
				...prev,
				currentCommunity: {
					id: communityDoc.id,
					...communityDoc.data(),
				} as Community,
			}));
		} catch (error: any) {
			console.log("getCommunityData", error.message);
		}
	};

	useEffect(() => {
		if (!user) {
			setCommunityStateValue((prev) => ({
				...prev,
				mySnippets: [],
				snippetsFetched: false,
			}));
			return;
		}
		getMySnippet();
	}, [user]);

	useEffect(() => {
		const { communityId } = router.query;

		if (communityId && !communityStateValue.currentCommunity) {
			getCommunityData(communityId as string);
		}
	}, [router.query, communityStateValue.currentCommunity]);

	return {
		communityStateValue,
		onJoinOrLeaveCommunity,
		loading,
	};
};
export default useCommunityData;
