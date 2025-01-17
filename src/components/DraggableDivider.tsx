import { useRef } from "react";

type Props = {
	initialWidth: number | undefined;
	onChangeWidth: (width: number) => void;
};
const DraggableDivider = ({ initialWidth, onChangeWidth }: Props) => {
	const dividerRef = useRef<HTMLDivElement | null>(null);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		const startX = e.clientX;
		const startWidth = initialWidth ?? 0;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const newWidth = startWidth + (moveEvent.clientX - startX);
			onChangeWidth(Math.max(newWidth, 140));
		};

		const handleMouseUp = () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<div
			className="asn-pane-divider"
			ref={dividerRef}
			onMouseDown={handleMouseDown}
		/>
	);
};

export default DraggableDivider;
