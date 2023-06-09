import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

//This is what a community will have
export interface Community {
	id: string;
	creatorId: string;
	numberOfMembers: number;
	privacyType: "public" | "restricted" | "private";
	createdAt?: Timestamp;
	imageUrl?: string;
}

//This is related to the user data, the communities joined by the user and each of it will be like
export interface CommunitySnippet {
	communityId: string;
	isModerator?: boolean;
	imageUrl?: string;
}

//This is an array of all the communities the user has joined
interface CommunityState {
	mySnippets: CommunitySnippet[];
	currentCommunity?: Community;
	snippetsFetched: boolean;
}

//recoil setup
const defaultCommunityState: CommunityState = {
	mySnippets: [],
	snippetsFetched: false,
};

export const communityState = atom<CommunityState>({
	key: "communitiesState",
	default: defaultCommunityState,
});
