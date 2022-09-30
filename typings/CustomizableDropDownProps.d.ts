/**
 * This file was generated from CustomizableDropDown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { ComponentType, CSSProperties } from "react";
import { DynamicValue, EditableValue, ListValue, ListAttributeValue, ListWidgetValue, ReferenceValue, WebIcon } from "mendix";

export interface CustomizableDropDownContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    data: ListValue;
    listSize: number;
    destinationAttribute: EditableValue<string>;
    destinationAssociation?: ReferenceValue;
    sourceAttribute?: ListAttributeValue<string>;
    content: ListWidgetValue;
    useFilter: boolean;
    filterAttribute?: ListAttributeValue<string>;
    emptyOnFocus: boolean;
    showClearButton: boolean;
    clearBtnIcon?: DynamicValue<WebIcon>;
}

export interface CustomizableDropDownPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    data: {} | { type: string } | null;
    listSize: number | null;
    destinationAttribute: string;
    destinationAssociation: string;
    onValueChange: {} | null;
    sourceAttribute: string;
    content: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    useFilter: boolean;
    filterAttribute: string;
    emptyOnFocus: boolean;
    showClearButton: boolean;
    clearBtnIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; } | null;
}
