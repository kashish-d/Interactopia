import { Flex, Icon, Image, MenuItem } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons/lib";
import useDirectory from "../../../hooks/useDirectory";

type MenuListItemProps = {
	displayText: string;
	link: string;
	icon: IconType;
	iconColor: string;
	imageUrl?: string;
};

const MenuListItem: React.FC<MenuListItemProps> = ({
	displayText,
	link,
	icon,
	iconColor,
	imageUrl,
}) => {
	const { onSelectMenuItem } = useDirectory();
	return (
		<MenuItem
			width="100%"
			fontSize="10pt"
			_hover={{ bg: "gray.100" }}
			onClick={() =>
				onSelectMenuItem({ displayText, link, icon, iconColor, imageUrl })
			}
		>
			<Flex align="center">
				{imageUrl ? (
					<Image
						src={imageUrl}
						boxSize="18px"
						borderRadius="full"
						mr={2}
						alt=""
					/>
				) : (
					<Icon as={icon} fontSize={20} mr={2} color={iconColor} />
				)}
				{displayText}
			</Flex>
		</MenuItem>
	);
};
export default MenuListItem;
