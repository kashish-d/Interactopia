import React, { useState } from "react";
import { Post } from "../../atoms/postAtom";
import { AiOutlineDelete } from "react-icons/ai";
import { BsChat, BsDot } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import {
	IoArrowDownCircleOutline,
	IoArrowDownCircleSharp,
	IoArrowRedoOutline,
	IoArrowUpCircleOutline,
	IoArrowUpCircleSharp,
	IoBookmarkOutline,
} from "react-icons/io5";
import {
	Alert,
	AlertIcon,
	Flex,
	Icon,
	Image,
	Skeleton,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/router";
import Link from "next/link";

type PostItemProps = {
	post: Post;
	userIsCreator: boolean;
	userVoteValue?: number;
	onVote: (
		event: React.MouseEvent<SVGElement, MouseEvent>,
		post: Post,
		vote: number,
		communityId: string
	) => void;
	onDeletePost: (post: Post) => Promise<boolean>;
	onSelectPost?: (post: Post) => void;
	homePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
	post,
	userIsCreator,
	userVoteValue,
	onDeletePost,
	onSelectPost,
	onVote,
	homePage,
}) => {
	const [loadingImage, setLoadingImage] = useState(true);
	const [loadingDelete, setLoadingDelete] = useState(false);
	const singlePostPage = !onSelectPost;
	const router = useRouter();

	const [error, setError] = useState(false);

	// console.log("PostItem", post, userIsCreator, userVoteValue);

	const handleDelete = async (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		event.stopPropagation();
		setLoadingDelete(true);
		// To do error handling, we are writing this function even though onDeletePost is available
		try {
			const success = await onDeletePost(post);
			if (!success) {
				throw new Error("Failed to delete post");
			}
			console.log("Post is successfully deleted");
			if (singlePostPage) {
				router.push(`/r/${post.communityId}`);
			}
		} catch (error: any) {
			setError(error.message);
		}
		setLoadingDelete(false);
	};

	return (
		<Flex
			border="1px solid"
			bg="white"
			borderColor={singlePostPage ? "white" : "gray.300"}
			borderRadius={singlePostPage ? "4px 4px 0px 0px" : 4}
			_hover={{ borderColor: singlePostPage ? "none" : "gray.500" }}
			cursor={singlePostPage ? "unset" : "pointer"}
			// As onSelectPost is optional, it can be undefined so checking if its not undefined
			onClick={() => onSelectPost && onSelectPost(post)}
		>
			<Flex
				direction="column"
				align="center"
				bg={singlePostPage ? "none" : "gray.100"}
				width="40px"
				borderRadius={singlePostPage ? "0" : "3px 0px 0px 3px"}
				p={2}
			>
				<Icon
					as={
						userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
					}
					color={userVoteValue === 1 ? "brand.100" : "gray.400"}
					fontSize={22}
					onClick={(event) => onVote(event, post, 1, post.communityId)}
					cursor="pointer"
				/>
				<Text fontSize="9pt">{post.voteStatus}</Text>
				<Icon
					as={
						userVoteValue === -1
							? IoArrowDownCircleSharp
							: IoArrowDownCircleOutline
					}
					color={userVoteValue === -1 ? "#4379ff" : "gray.400"}
					fontSize={22}
					onClick={(event) => onVote(event, post, -1, post.communityId)}
					cursor="pointer"
				/>
			</Flex>
			<Flex direction="column" width="100%">
				{error && (
					<Alert status="error">
						<AlertIcon />
						<Text mr={2}>{error}</Text>
					</Alert>
				)}
				<Stack p="10px" spacing={1}>
					<Stack direction="row" spacing={0.6} align="center" fontSize="9pt">
						{/* Home page check */}
						{homePage && (
							<>
								{post.communityImageUrl ? (
									<Image
										src={post.communityImageUrl}
										alt={"communityProfile"}
										borderRadius="full"
										boxSize="18px"
										mr={2}
									/>
								) : (
									<Icon as={FaReddit} fontSize="18pt" mr={1} color="blue.500" />
								)}
								{/* <Link href={`r/${post.communityId}`}> */}
								<Text
									fontWeight={700}
									_hover={{ textDecoration: "underline" }}
									onClick={(event) => {
										event.stopPropagation();
										//this approach works and next app autloads as well
										//using link with stopPropogation stops the autoload(navigate with reload)
										router.push(`r/${post.communityId}`);
									}}
								>
									{`r/${post.communityId}`}
								</Text>
								{/* </Link> */}
								<Icon as={BsDot} color="gray.500" fontSize={8} />
							</>
						)}
						<Text>
							Posted by u/{post.creatorDisplayName}{" "}
							{moment(new Date(post.createdAt.seconds * 1000)).fromNow()}
						</Text>
					</Stack>
					<Text fontSize="12pt" fontWeight={600}>
						{post.title}
					</Text>
					<Text fontSize="10pt">{post.body}</Text>
					{post.imageUrl && (
						<Flex justify="center" align="center" p={2}>
							{loadingImage && (
								<Skeleton height="200px" width="100%" borderRadius={4} />
							)}
							<Image
								src={post.imageUrl}
								maxHeight="460px"
								alt="post-image"
								display={loadingImage ? "none" : "unset"}
								onLoad={() => setLoadingImage(false)}
							/>
						</Flex>
					)}
				</Stack>
				<Flex ml={1} mb={0.5} color="gray.500">
					<Flex
						align="center"
						p="8px 10px"
						borderRadius={4}
						_hover={{ bg: "gray.200" }}
						cursor="pointer"
					>
						<Icon as={BsChat} mr={2} />
						<Text fontSize="9pt">{post.numberOfComments}</Text>
					</Flex>
					<Flex
						align="center"
						p="8px 10px"
						borderRadius={4}
						_hover={{ bg: "gray.200" }}
						cursor="pointer"
					>
						<Icon as={IoArrowRedoOutline} mr={2} />
						<Text fontSize="9pt">Share</Text>
					</Flex>
					<Flex
						align="center"
						p="8px 10px"
						borderRadius={4}
						_hover={{ bg: "gray.200" }}
						cursor="pointer"
					>
						<Icon as={IoBookmarkOutline} mr={2} />
						<Text fontSize="9pt">Save</Text>
					</Flex>
					{userIsCreator && (
						<Flex
							align="center"
							p="8px 10px"
							borderRadius={4}
							_hover={{ bg: "gray.200" }}
							cursor="pointer"
							onClick={handleDelete}
						>
							{loadingDelete ? (
								<Spinner size="sm" />
							) : (
								<>
									<Icon as={AiOutlineDelete} mr={2} />
									<Text fontSize="9pt">Delete</Text>
								</>
							)}
						</Flex>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
};
export default PostItem;
