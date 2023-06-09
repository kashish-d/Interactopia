import { authModalState } from "../../../atoms/authModalAtom";
import { Button } from "@chakra-ui/react";
import React from "react";
import { useSetRecoilState } from "recoil";

const AuthButtons: React.FC = () => {
	const setAuthModalState = useSetRecoilState(authModalState);
	// here we dont actually require the value if its open or not but just need to change the value to
	// trigger modals so we are not using useRecoilState but only useSetRecoilState
	return (
		<>
			<Button
				variant="outline"
				height="28px"
				display={{ base: "none", sm: "flex" }}
				width={{ base: "70px", md: "110px" }}
				mr={2}
				onClick={() => setAuthModalState({ open: true, view: "login" })}
			>
				Log In
			</Button>
			<Button
				variant="solid"
				height="28px"
				display={{ base: "none", sm: "flex" }}
				width={{ base: "70px", md: "110px" }}
				mr={2}
				onClick={() => setAuthModalState({ open: true, view: "signup" })}
			>
				Sign Up
			</Button>
		</>
	);
};
export default AuthButtons;
