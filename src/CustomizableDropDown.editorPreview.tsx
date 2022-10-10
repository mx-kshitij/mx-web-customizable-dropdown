import { Component, ReactNode} from "react";
import { CustomizableDropDownPreviewProps } from "../typings/CustomizableDropDownProps";

declare function require(name: string): string;

export class preview extends Component<CustomizableDropDownPreviewProps> {
    render(): ReactNode {
        return null;
    }
}

export function getPreviewCss(): string {
    return require("./ui/CustomizableDropDown.css");
}
