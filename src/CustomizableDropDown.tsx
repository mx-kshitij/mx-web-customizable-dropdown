import { createElement, useEffect, useState } from "react";
import { ObjectItem } from 'mendix';
import { Icon } from 'mendix/components/web/Icon';
import { attribute, literal, contains, startsWith } from "mendix/filters/builders";
import { CustomizableDropDownContainerProps } from "../typings/CustomizableDropDownProps";
import "./ui/CustomizableDropDown.css";


export interface dropdownOption {
    index: number;
    option: ObjectItem;
}

export function CustomizableDropDown({
    name,
    destinationAttribute,
    destinationAssociation,
    data,
    content,
    useFilter,
    filterAttribute,
    sourceAttribute,
    emptyOnFocus,
    listSize,
    showClearButton,
    clearBtnIcon,
    placeholder,
    filterType
    // inputTimeout
}: CustomizableDropDownContainerProps) {

    if (data.status === "loading") {
        return (<div />);
    }

    const [searchText, setSearchText] = useState<string>("");
    const [searchResults, setSearchResults] = useState<ObjectItem[] | undefined>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [showBtnVisible, setShowBtnVisible] = useState<boolean>(false);
    var setValueTimeout: any;

    //@ts-ignore
    if (!window.customDropDownOptions) window.customDropDownOptions = [];

    //Function to update input textbox on attribute value change
    useEffect(() => {
        setSearchText(destinationAttribute.displayValue);
    }, [destinationAttribute])

    //Function to update dataset and apply filters
    useEffect(() => {
        if (useFilter && filterAttribute != undefined && searchText != undefined && searchText != "") {
            if(filterType === "contains"){
                const filterCond = contains(attribute(filterAttribute.id), literal(searchText))
                data.setFilter(filterCond);
            }
            else if(filterType === "startsWith"){
                const filterCond = startsWith(attribute(filterAttribute.id), literal(searchText))
                data.setFilter(filterCond);
            }
        }
        data.setLimit(listSize);
        setSearchResults(data.items);
    }, [data, searchText])

    //Function to detect click outside the widget
    useEffect(() => {
        document.addEventListener('mouseup', function (e: any) {
            var outer = document.getElementById(name + "wrapper");
            if (!(outer?.contains(e.target))) {
                setShowResults(false);
                setShowBtnVisible(false);
            }
        })
    }, [])

    //Function to render the list
    const renderList = () => {
        //check if any search results
        if (searchResults === null || searchResults === undefined || searchResults.length === 0 || searchText.trim() === "" || !(showResults)) {
            return null;
        }

        //return the list of results
        return (
            <div id={"customListNode" + name} className="customDropdownList">
                <ul>
                    {searchResults.map((item: ObjectItem, index: number) => {
                        if (item && index) {
                            return (<li key={index} id={`$content-li$${index}`} className="listItem" onClick={selectItem} data-index={index}>
                                <div key={index} id={`$content-div$${index}`}>
                                    {content?.get(item)}
                                </div>
                            </li>)
                        }
                    })}
                </ul>
            </div>
        )
    }

    //function to run on selecting a value
    const selectItem = (item: any) => {
        //Get the list item for the option
        var listItem = item.target.closest(".listItem");

        //Get the item index
        var itemIndex = listItem.getAttribute('data-index');

        //Get the mx object from index
        var selectedItem = searchResults?.at(itemIndex);

        //Set the textbox value
        if (selectedItem && sourceAttribute && destinationAttribute) destinationAttribute.setValue(sourceAttribute.get(selectedItem).displayValue);

        //Set the association if any
        if (destinationAssociation && selectedItem) destinationAssociation.setValue(selectedItem);

        setShowResults(false);
        setShowBtnVisible(false);
    }

    //function to run on change of text in input textbox
    const updateData = (element: any) => {
        if(setValueTimeout) clearTimeout(setValueTimeout);
        var value: string = element.target.value;
        setSearchText(value);

        // const setValue = () => {
            if (value.trim() != "") {
                setShowResults(true);
                setShowBtnVisible(true);
            }
            else {
                setShowBtnVisible(false);
            }
            clearTimeout(setValueTimeout);
        // }

        // setValueTimeout = setTimeout(setValue, inputTimeout);
    }

    //function to run on focus
    const runOnFocus = (element: any) => {
        if (emptyOnFocus) {
            setSearchText("");
        }
        else {
            element.target.select();
            searchText.trim() != "" ? setShowBtnVisible(true) : setShowBtnVisible(false);
        }
        setShowResults(false);
    }

    // Function to render the clear button
    const renderClearButton = () => {
        if (showBtnVisible) {
            return (
                <div className="textBoxClearBtn" onClick={clearInput}>
                    <Icon icon={clearBtnIcon?.value} />
                </div>)
        }
        else {
            return null;
        }
    }

    // Function to clear the textbox on click of clear button
    const clearInput = () => {
        setSearchText("");
        setShowResults(false);
        setShowBtnVisible(false);
        if (destinationAttribute) destinationAttribute.setValue("");
        if (destinationAssociation) destinationAssociation.setValue(undefined);
    }

    //function to render the textbox
    const renderTextBox = () => {
        if (!showClearButton) {
            return (<input type="text" id={"customDropDownSearch" + name} className="textBoxInput" onInput={updateData} onFocus={runOnFocus} value={searchText} placeholder={placeholder?.value} />)
        }
        else {
            return (
                <div>
                    <input type="text" id={"customDropDownSearch" + name} className="textBoxInput" onInput={updateData} onFocus={runOnFocus} value={searchText} placeholder={placeholder?.value} />
                    {renderClearButton()}
                </div>)
        }

    }

    //main return function
    return (
        <div id={name + "wrapper"}>
            {renderTextBox()}
            {renderList()}
        </div>
    )
}