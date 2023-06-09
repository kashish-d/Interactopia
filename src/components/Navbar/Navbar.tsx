import { Flex, Image, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import SearchInput from "./SearchInput";
import RightContent from "./RightContent/RightContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/clientApp";
import Directory from "./Directory/Directory";
import useDirectory from "../../hooks/useDirectory";
import { defaultMenuItem } from "../../atoms/directoryMenuAtom";

const Navbar: React.FC = () => {
	const [user, loading, error] = useAuthState(auth);
	const { onSelectMenuItem } = useDirectory();
	return (
		<Flex
			bg="white"
			height="44px"
			padding="6px 12px"
			justify={{ md: "space-between" }}
		>
			<Flex
				align="center"
				width={{ base: "40px", md: "auto" }}
				mr={{ base: 0, md: 2 }}
				cursor="pointer"
				onClick={() => onSelectMenuItem(defaultMenuItem)}
			>
				<Image src="/images/redditFace.svg" alt="" height="30px" />
				<Text
					display={{ base: "none", md: "unset" }}
					fontSize="12pt"
					fontFamily="cursive"
					ml={2}
					fontWeight={600}
				>
					Interactop
					<span style={{ color: "#ff3c00" }}>i</span>a
				</Text>
			</Flex>
			{user && <Directory />}
			<SearchInput user={user} />
			<RightContent user={user} />
		</Flex>
	);
};
export default Navbar;
