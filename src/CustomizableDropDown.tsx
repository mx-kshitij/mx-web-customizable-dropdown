import { createElement, useEffect, useState } from "react";
import { ObjectItem } from 'mendix';
import { Icon } from 'mendix/components/web/Icon';
import { attribute, literal, contains, startsWith} from "mendix/filters/builders";
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
    onValueChange,
    useFilter,
    filterAttribute,
    filterType,
    sourceAttribute,
    emptyOnFocus,
    listSize,
    showClearButton,
    clearBtnIcon,
    placeholder,
    inputTimeout,
    autoComplete
}: CustomizableDropDownContainerProps) {

    if (destinationAttribute.status === "loading") {
        return (<div />);
    }

    const [searchText, setSearchText] = useState<string>("");
    const [searchResults, setSearchResults] = useState<ObjectItem[] | undefined>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [showBtnVisible, setShowBtnVisible] = useState<boolean>(false);
    const [timeoutId, setTimeoutId] = useState<any>(null);
    const [focusedListItem, setFocusedListItem] = useState<HTMLElement | Element | null | undefined>();

    //@ts-ignore
    if (!window.customDropDownOptions) window.customDropDownOptions = [];

    //Function to update input textbox on attribute value change
    useEffect(() => {
        setSearchText(destinationAttribute.displayValue);
    }, [destinationAttribute])

    //Function to apply filters
    const applyFilters = () => {
        destinationAttribute.setValue(searchText);
        if (useFilter && filterAttribute != undefined && searchText != undefined && searchText != "") {
            if (filterType === "contains") {
                const filterCond = contains(attribute(filterAttribute.id), literal(searchText))
                data.setFilter(filterCond);
            }
            else if (filterType === "startsWith") {
                const filterCond = startsWith(attribute(filterAttribute.id), literal(searchText))
                data.setFilter(filterCond);
            }
        }
        data.setLimit(listSize);
        setSearchResults(data.items);
    }

    //Function to update dataset and apply filters
    useEffect(() => {
        //Clear previous timeout
        if (timeoutId) clearTimeout(timeoutId);

        //Set new timeout
        var id = setTimeout(applyFilters, inputTimeout);
        setTimeoutId(id);
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
                        return (<li key={index} id={`content-li${index}`} className="listItem" onClick={selectItem} onMouseOver={runOnOptionFocus} data-index={index}>
                            <div key={index} id={`content-div${index}`}>
                                {content?.get(item)}
                            </div>
                        </li>)
                    })}
                </ul>
            </div>
        )
    }

    // Function to run when mouse over a list item
    const runOnOptionFocus = (event: any) => {
        //Get currently focused element(s)
        var currentFocusElements = document.getElementsByClassName("listItemFocused");
        
        //Remove styling class to show focus
        for (var i = 0; i < currentFocusElements.length; i++) currentFocusElements[i].classList.remove("listItemFocused");

        //Set styling class on new item 
        var item = event.target.closest(".listItem");
        item.classList.add("listItemFocused");
        setFocusedListItem(item);
    }

    // Function to run when up/down/tab/enter key is pressed
    const onKeyDown = (event: any) => {
        switch (event.keyCode) {
            case 38:
                //when up key is pressed, get previous element and focus
                var prevItem: HTMLElement | Element | null | undefined;
                if (focusedListItem) {
                    focusedListItem.classList.remove("listItemFocused");
                    prevItem = focusedListItem.previousElementSibling;
                }
                else {
                    var firstItem: HTMLElement | null;
                    firstItem = document.getElementById("content-li0");
                    prevItem = firstItem?.parentElement?.lastElementChild;
                }
                if (prevItem) {
                    prevItem.classList.add("listItemFocused");
                    prevItem.scrollIntoView();
                    setFocusedListItem(prevItem);
                }
                else {
                    setFocusedListItem(null);
                }
                break;
            case 40:
                //when down key is pressed, get next element and focus
                var nextItem: Element | null | undefined;
                if (focusedListItem) {
                    focusedListItem.classList.remove("listItemFocused");
                    nextItem = focusedListItem.nextElementSibling;
                }
                else {
                    nextItem = document.getElementById("content-li0");
                }
                if (nextItem) {
                    nextItem.classList.add("listItemFocused");
                    nextItem.scrollIntoView();
                    setFocusedListItem(nextItem);
                }
                else {
                    setFocusedListItem(null);
                }
                break;
            case 9:
                //when TAB is pressed
                if (focusedListItem) {
                    setSelectedItem(focusedListItem);
                }
                break;
            case 13:
                //when ENTER is pressed
                if (focusedListItem) {
                    setSelectedItem(focusedListItem);
                }
                break;
        }
    }

    //Function to run on selecting a list item
    const selectItem = (item: any) => {
        //Get the list item for the option
        var listItem = item.target.closest(".listItem");
        setSelectedItem(listItem);
    }

    //Function to run to select a specific item
    const setSelectedItem = (listItem: any) => {
        //Get the item index
        var itemIndex = listItem.getAttribute('data-index');

        //Get the mx object from index
        var selectedItem = searchResults?.at(itemIndex);

        //Set the textbox value
        if (selectedItem && sourceAttribute && destinationAttribute) {
            var finalValue = sourceAttribute.get(selectedItem).displayValue;
            destinationAttribute.setValue(finalValue);
            setSearchText(finalValue);
        }

        //Set the association if any
        if (destinationAssociation && selectedItem) destinationAssociation.setValue(selectedItem);

        //Execute on value change
        if(onValueChange && onValueChange.canExecute && !onValueChange.isExecuting) onValueChange.execute();

        setShowResults(false);
        setShowBtnVisible(false);
        setFocusedListItem(null);
    }

    //function to run on change of text in input textbox
    const updateData = (element: any) => {
        //Get the value from input field
        var value: string = element.target.value;

        //Update state with value
        setSearchText(value);

        //Show results
        if (value.trim() != "") {
            setShowResults(true);
            setShowBtnVisible(true);
        }
        else {
            setShowBtnVisible(false);
        }
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
        //Clear search text, results, attribute and association.
        setSearchText("");
        setShowResults(false);
        setShowBtnVisible(false);
        if (destinationAttribute) destinationAttribute.setValue("");
        if (destinationAssociation) destinationAssociation.setValue(undefined);
    }

    //function to render the textbox
    const renderTextBox = () => {
        if (!showClearButton) {
            return (<input type="text" id={"customDropDownSearch" + name} className="textBoxInput" onInput={updateData} onFocus={runOnFocus} value={searchText} placeholder={placeholder?.value} onKeyDown={onKeyDown} autoComplete={autoComplete}/>)
        }
        else {
            return (
                <div>
                    <input type="text" id={"customDropDownSearch" + name} className="textBoxInput" onInput={updateData} onFocus={runOnFocus} value={searchText} placeholder={placeholder?.value} onKeyDown={onKeyDown} autoComplete={autoComplete}/>
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