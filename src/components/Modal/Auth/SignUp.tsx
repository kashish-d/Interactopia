import { Button, Flex, Input, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";

//Firebase stores the user details securely and also encrypts the passwords so we don't have to (here);

const SignUp: React.FC = () => {
	//Global state for modal
	const setAuthModalState = useSetRecoilState(authModalState);

	// State for inputs
	const [signUpForm, setSignUpForm] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [error, setError] = useState("");

	// firebase hooks
	const [createUserWithEmailAndPassword, userCred, loading, userError] =
		useCreateUserWithEmailAndPassword(auth);

	// Form submit handler
	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (error) setError("");

		//Firebase giving an error on small passwords, so implemented an error check
		if (signUpForm.password.length < 6) {
			setError("Password length must be atleast 7");
			return;
		}

		// if passwords do not match
		if (signUpForm.password !== signUpForm.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		//if passwords match
		createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
	};

	//.ChangeEvent<HTMLInputElements> all typescript stuff
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSignUpForm((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	};

	//Adding the user to the firestore database (different from authentication because both cannot be mixed in firebase)
	//Have to add users to the firestore database to add multiple properties to each user (user details)
	const createUserDocument = async (user: User) => {
		await setDoc(
			doc(firestore, "users", user.uid),
			JSON.parse(JSON.stringify(user))
		);
	};

	useEffect(() => {
		if (userCred) {
			createUserDocument(userCred.user);
		}
	}, [userCred]);

	return (
		<form onSubmit={onSubmit}>
			<Input
				required
				name="email"
				placeholder="Email"
				type="email"
				mb={2}
				onChange={onChange}
				fontSize="10pt"
				_placeholder={{ color: "gray.500" }}
				_hover={{
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				_focus={{
					outline: "none",
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				bg="gray.50"
			/>
			<Input
				required
				name="password"
				placeholder="Password"
				type="password"
				mb={2}
				onChange={onChange}
				fontSize="10pt"
				_placeholder={{ color: "gray.500" }}
				_hover={{
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				_focus={{
					outline: "none",
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				bg="gray.50"
			/>
			<Input
				required
				name="confirmPassword"
				placeholder="Confirm Password"
				type="password"
				mb={2}
				onChange={onChange}
				fontSize="10pt"
				_placeholder={{ color: "gray.500" }}
				_hover={{
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				_focus={{
					outline: "none",
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				bg="gray.50"
			/>
			{(error || userError) && (
				<Text textAlign="center" color="red" fontSize="10pt">
					{error ||
						FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS]}
				</Text>
			)}
			<Button
				type="submit"
				width="100%"
				height="36px"
				mt={2}
				mb={2}
				isLoading={loading}
			>
				Sign Up
			</Button>
			<Flex fontSize="9pt" justifyContent="center">
				<Text mr={1}>Already a redditor?</Text>
				<Text
					color="blue.500"
					fontWeight={700}
					cursor="pointer"
					onClick={() =>
						setAuthModalState((prev) => ({
							...prev,
							view: "login",
						}))
					}
				>
					Log In
				</Text>
			</Flex>
		</form>
	);
};
export default SignUp;
