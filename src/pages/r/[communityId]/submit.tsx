import React from "react";
import PageContent from "../../../components/Layout/PageContent";
import { Box, Text } from "@chakra-ui/react";
import NewPostForm from "../../../components/Posts/NewPostForm";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";
import { useRecoilValue } from "recoil";
import { communityState } from "../../../atoms/communitiesAtom";
import useCommunityData from "../../../hooks/useCommunityData";
import About from "../../../components/Community/About";

const SubmitPostPage: React.FC = () => {
	const [user] = useAuthState(auth);
	// const communityStateValue = useRecoilValue(communityState);
	const { communityStateValue } = useCommunityData();
	console.log("COMMUNITY", communityStateValue);
	return (
		<PageContent>
			<>
				<Box p="14px 0px" borderBottom="1px solid white">
					<Text>Create a Post</Text>
				</Box>
				{user && (
					<NewPostForm
						user={user}
						communityImageUrl={communityStateValue.currentCommunity?.imageUrl}
					/>
				)}
			</>
			<>
				{communityStateValue.currentCommunity && (
					<About communityData={communityStateValue.currentCommunity} />
				)}
			</>
		</PageContent>
	);
};
export default SubmitPostPage;
