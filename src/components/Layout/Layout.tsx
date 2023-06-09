import React from "react";
import Navbar from "../Navbar/Navbar";

//Just React 18 things to use the children props. NEED TO UNDERSTAND
interface BaseLayoutProps {
	children?: React.ReactNode;
}

//React.FC just means that we are returning react functional components
const Layout: React.FC<BaseLayoutProps> = ({ children }) => {
	return (
		<>
			<Navbar />
			<main>{children}</main>
		</>
	);
};
export default Layout;
