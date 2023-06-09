import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { Community } from "../../atoms/communitiesAtom";
import React from "react";
import { FaReddit } from "react-icons/fa";
import useCommunityData from "../../hooks/useCommunityData";

type HeaderProps = {
	communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
	const { communityStateValue, onJoinOrLeaveCommunity, loading } =
		useCommunityData();
	const isJoined = !!communityStateValue.mySnippets.find(
		(item) => item.communityId === communityData.id
	);
	//The double bang operator (!!) is an efficient and concise way to convert a value to its boolean equivalent.
	return (
		<Flex direction="column" height="146px" width="100%">
			<Box height="50%" bg="blue.400" />
			<Flex justify="center" bg="white" flexGrow={1}>
				<Flex width="95%" maxWidth="860px">
					{/* we are using communityStateValue and not communityData because communityStateValue 
						is updated everytime we change the picture. communityData will not be updated unless we reload
						the page, in which case, the updated image will be taken from the database
					*/}
					{communityStateValue.currentCommunity?.imageUrl ? (
						<Image
							src={communityStateValue.currentCommunity.imageUrl}
							alt="community-image"
							borderRadius="full"
							boxSize="66px"
							position="relative"
							top={-3}
							color="blue.500"
							border="4px solid white"
						/>
					) : (
						<Icon
							as={FaReddit}
							fontSize={64}
							position="relative"
							top={-3}
							color="blue.500"
							border="4px solid white"
							borderRadius="50%"
						/>
					)}
					<Flex padding="10px 6px">
						<Flex direction="column" mr={6}>
							<Text fontWeight={800} fontSize="16pt">
								{communityData.id}
							</Text>
							<Text fontWeight={600} fontSize="10pt" color="gray.400">
								r/{communityData.id}
							</Text>
						</Flex>
						<Button
							variant={isJoined ? "outline" : "solid"}
							height="30px"
							pl={6}
							pr={6}
							onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}
							isLoading={loading}
						>
							{isJoined ? "Joined" : "Join"}
						</Button>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
};
export default Header;
