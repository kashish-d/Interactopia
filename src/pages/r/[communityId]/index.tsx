import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import safeJsonStringify from "safe-json-stringify";
import NotFound from "../../../components/Community/NotFound";
import Header from "../../../components/Community/Header";
import PageContent from "../../../components/Layout/PageContent";
import CreatePostLink from "../../../components/Community/CreatePostLink";
import Posts from "../../../components/Posts/Posts";
import { useSetRecoilState } from "recoil";
import About from "../../../components/Community/About";

type CommunityPageProps = {
	communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
	const setCommunityStateValue = useSetRecoilState(communityState);
	useEffect(() => {
		setCommunityStateValue((prev) => ({
			...prev,
			currentCommunity: communityData,
		}));
	}, [communityData]);

	if (!communityData) {
		return <NotFound />;
	}

	return (
		<>
			<Header communityData={communityData} />
			<PageContent>
				<>
					<CreatePostLink />
					<Posts communityData={communityData} />
				</>
				<>
					<About communityData={communityData} />
				</>
			</PageContent>
		</>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	// According to my understanding,This function will run after recieving request from browser. Nextjs will
	// call this function in the server itself and get me the data from firebase and supply this data to the client
	// side functions like the component above as props
	// Return object here is going to be sent to the component as props which we can use in our interface
	// This is different from simple react as we didn't first render the component at client side and then
	// got data from firebase and then just filled it in. we actually rendereed the component with the data already
	// filled

	//get the community data and pass it to the client
	try {
		const communityDocRef = doc(
			firestore,
			"communities",
			context.query.communityId as string //communityId here is the params from the url
		);
		const communityDoc = await getDoc(communityDocRef);

		return {
			props: {
				communityData: communityDoc.exists()
					? JSON.parse(
							safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
					  )
					: "", //data is a firebase method to get data and it doesnot have id property so manually making one
			},
		};
	} catch (error) {
		// Could add an error page here
		console.log("getServerSideProps error", error);
	}
}

export default CommunityPage;
