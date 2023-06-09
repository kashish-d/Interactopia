import { atom } from "recoil";

export interface AuthModalState {
	open: boolean;
	view: "login" | "signup" | "resetPassword";
}
// | means OR pipe operator in TypeScript

const defaultModalState: AuthModalState = {
	open: false,
	view: "login",
};

export const authModalState = atom<AuthModalState>({
	key: "authModalState",
	default: defaultModalState,
});
