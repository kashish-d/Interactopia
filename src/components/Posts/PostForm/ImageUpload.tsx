import { Button, Flex, Image, Stack } from "@chakra-ui/react";
import React, { useRef } from "react";

type ImageUploadProps = {
	selectedFile?: string;
	onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
	setSelectedTab: (value: string) => void;
	setSelectedFile: (value: string) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
	selectedFile,
	setSelectedFile,
	setSelectedTab,
	onSelectImage,
}) => {
	const selectedFileRef = useRef<HTMLInputElement>(null);

	return (
		<Flex justify="center" direction="column" align="center" width="100%">
			{selectedFile ? (
				<>
					<Image
						src={selectedFile}
						alt="post"
						maxHeight="400px"
						maxWidth="400px"
					/>
					<Stack direction="row" mt={4}>
						<Button height="28px" onClick={() => setSelectedTab("Post")}>
							Back to Post
						</Button>
						<Button
							variant="outline"
							height="28px"
							onClick={() => setSelectedFile("")}
						>
							Remove
						</Button>
					</Stack>
				</>
			) : (
				<Flex
					justify="center"
					align="center"
					p={20}
					border="1px dashed"
					borderColor="gray.200"
					width="100%"
					borderRadius={4}
				>
					<Button
						variant="outline"
						height="28px"
						onClick={() => selectedFileRef.current?.click()}
						//Clicking this button will trigger a click on the input button for selecting a file
					>
						Upload
					</Button>
					<input
						ref={selectedFileRef}
						type="file"
						hidden
						onChange={onSelectImage}
					/>
					<img src={selectedFile} />
				</Flex>
			)}
		</Flex>
	);
};
export default ImageUpload;
