import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Flex,
	Icon,
	Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BiPoll } from "react-icons/bi";
import { BsMic, BsLink45Deg } from "react-icons/bs";
import { IoImageOutline, IoDocumentText } from "react-icons/io5";
import { AiFillCloseCircle } from "react-icons/ai";
import TabItem from "./TabItem";
import TextInputs from "./PostForm/TextInputs";
import ImageUpload from "./PostForm/ImageUpload";
import { Post } from "../../atoms/postAtom";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import {
	Timestamp,
	addDoc,
	collection,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase/clientApp";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useSelectFile from "../../hooks/useSelectFile";

type NewPostFormProps = {
	user: User;
	communityImageUrl?: string;
};

const formTabs: TabItemType[] = [
	{
		title: "Post",
		icon: IoDocumentText,
	},
	{
		title: "Images & Video",
		icon: IoImageOutline,
	},
	{
		title: "Link",
		icon: BsLink45Deg,
	},
	{
		title: "Poll",
		icon: BiPoll,
	},
	{
		title: "Talk",
		icon: BsMic,
	},
];

export type TabItemType = {
	title: string;
	icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({
	user,
	communityImageUrl,
}) => {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
	const [textInputs, setTextInputs] = useState({
		title: "",
		body: "",
	});
	const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const handleCreatePost = async () => {
		//create new post object  => Type Post
		const { communityId } = router.query;

		const newPost: Post = {
			communityId: communityId as string,
			communityImageUrl: communityImageUrl || "", //empty string because firebase won't like undefined
			creatorId: user?.uid,
			creatorDisplayName: user.email!.split("@")[0], //! bang operator in TypeScript to tell that value will be valid
			title: textInputs.title,
			body: textInputs.body,
			numberOfComments: 0,
			voteStatus: 0,
			createdAt: serverTimestamp() as Timestamp,
		};

		setLoading(true);
		//Store the post in db
		try {
			const postDocRef = await addDoc(collection(firestore, "posts"), newPost);

			//check for selectedFile
			if (selectedFile) {
				//store in firebase storage => getDownloadUrl(return imageURL)
				const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
				await uploadString(imageRef, selectedFile, "data_url");
				const downloadUrl = await getDownloadURL(imageRef);

				//update post doc by adding imageURL
				await updateDoc(postDocRef, {
					imageUrl: downloadUrl,
				});
			}

			//redirect the user back to the communityPage using the router
			router.back();
		} catch (error: any) {
			console.log("handleCreatePost error", error.message);
			setError(true);
		}
		setLoading(false);
	};

	const onTextChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {
			target: { name, value },
		} = event;
		setTextInputs((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<Flex direction="column" borderRadius={4} mt={2} bg="white">
			<Flex width="100%">
				{formTabs.map((item, index) => (
					<TabItem
						item={item}
						key={index}
						selected={item.title === selectedTab}
						setSelectedTab={setSelectedTab}
					/>
				))}
			</Flex>
			<Flex p={4}>
				{selectedTab === "Post" && (
					<TextInputs
						textInputs={textInputs}
						handleCreatePost={handleCreatePost}
						onChange={onTextChange}
						loading={loading}
					/>
				)}
				{selectedTab === "Images & Video" && (
					<ImageUpload
						selectedFile={selectedFile}
						onSelectImage={onSelectFile}
						setSelectedTab={setSelectedTab}
						setSelectedFile={setSelectedFile}
					/>
				)}
			</Flex>
			{error && (
				<Alert status="error">
					<AlertIcon />
					<Text>Error creating post</Text>
				</Alert>
			)}
		</Flex>
	);
};
export default NewPostForm;
