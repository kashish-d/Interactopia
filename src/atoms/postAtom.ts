import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

// Do not fully understand what's happening here

//A single post structure
export type Post = {
	id?: string;
	communityId: string;
	creatorId: string;
	creatorDisplayName: string;
	title: string;
	body: string;
	numberOfComments: number;
	voteStatus: number;
	imageUrl?: string;
	communityImageUrl?: string;
	createdAt: Timestamp;
};

export type PostVote = {
	id: string;
	postId: string;
	communityId: string;
	voteValue: number;
};

interface PostState {
	selectedPost: Post | null;
	posts: Post[];
	postVotes: PostVote[];
}

const defaultPostState: PostState = {
	selectedPost: null,
	posts: [],
	postVotes: [],
};

export const postState = atom({
	key: "postState",
	default: defaultPostState,
});
