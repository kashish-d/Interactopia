import React, { useState } from "react";

const useSelectFile = () => {
	const [selectedFile, setSelectedFile] = useState<string>();

	const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log("THIS IS HAPPENING", event);

		const reader = new FileReader(); // A javascript async function that reads the file from input(type=file)
		if (event.target.files?.[0]) {
			// this will give me the file as an url that i can use
			reader.readAsDataURL(event.target.files[0]);
		}

		// onload will trigger when the image/file is fully read, here we use that to update the state var
		reader.onload = (readerEvent) => {
			if (readerEvent.target?.result) {
				setSelectedFile(readerEvent.target.result as string);
			}
		};
	};
	return {
		selectedFile,
		setSelectedFile,
		onSelectFile,
	};
};
export default useSelectFile;
