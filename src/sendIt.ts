import React, { useEffect, useState } from "react";
import { AlertStatus, ExtensionLocalSettings, ExtensionSyncSettings, OutputPreset, StatusResponse } from "./types";
import { compileTemplate, compileToMemo, getLocalSettings, getSyncSettings, obsidianRequest } from "./utils";
import OnClickData = chrome.contextMenus.OnClickData;

//
// const SendIt = (info:OnClickData) => {
//     const [status, setStatus] = useState<AlertStatus>();
//
//     const [sandboxReady, setSandboxReady] = useState<boolean>(false);
//     const [obsidianUnavailable, setObsidianUnavailable] =
//         useState<boolean>(false);
//     const [ready, setReady] = useState<boolean>(false);
//     const [apiKey, setApiKey] = useState<string>("");
//     const [insecureMode, setInsecureMode] = useState<boolean>(false);
//
//     const [url, setUrl] = useState<string>("");
//     const [title, setTitle] = useState<string>("");
//     const [selection, setSelection] = useState<string>("");
//     const [pageContent, setPageContent] = useState<string>("");
//
//     const [method, setMethod] = useState<OutputPreset["method"]>("patch");
//     const [overrideUrl, setOverrideUrl] = useState<string>();
//     const [compiledUrl, setCompiledUrl] = useState<string>("");
//     const [headers, setHeaders] = useState<Record<string, string>>({});
//     const [compiledContent, setCompiledContent] = useState<string>("");
//
//     const [presets, setPresets] = useState<OutputPreset[]>([]);
//     const [selectedPreset, setSelectedPreset] = useState<number>(0);
//
//     window.addEventListener(
//         "message",
//         () => {
//             setSandboxReady(true);
//         },
//         {
//             once: true,
//         }
//     );
//
//     useEffect(() => {
//         if (!apiKey) {
//             return;
//         }
//
//         async function handle() {
//             try {
//                 const request = await obsidianRequest(
//                     apiKey,
//                     "/",
//                     { method: "get" },
//                     insecureMode
//                 );
//                 const result: StatusResponse = await request.json();
//                 if (
//                     result.status === "OK" &&
//                     result.service.includes("Obsidian Local REST API")
//                 ) {
//                     setObsidianUnavailable(false);
//                 } else {
//                     setObsidianUnavailable(true);
//                 }
//             } catch (e) {
//                 setObsidianUnavailable(true);
//             }
//         }
//         handle();
//     }, []);
//
//     useEffect(() => {
//         async function handle() {
//             let syncSettings: ExtensionSyncSettings;
//             let localSettings: ExtensionLocalSettings;
//
//             try {
//                 localSettings = await getLocalSettings(chrome.storage.local);
//             } catch (e) {
//                 setStatus({
//                     severity: "error",
//                     title: "Error",
//                     message: "Could not get local settings!",
//                 });
//                 return;
//             }
//
//             try {
//                 syncSettings = await getSyncSettings(chrome.storage.sync);
//                 setPresets(syncSettings.presets);
//             } catch (e) {
//                 setStatus({
//                     severity: "error",
//                     title: "Error",
//                     message: "Could not get settings!",
//                 });
//                 return;
//             }
//
//             setApiKey(localSettings.apiKey);
//         }
//         handle();
//     }, []);
//
//     useEffect(() => {
//         async function handle() {
//             let tab: chrome.tabs.Tab;
//             try {
//                 const tabs = await chrome.tabs.query({
//                     active: true,
//                     currentWindow: true,
//                 });
//                 tab = tabs[0];
//             } catch (e) {
//                 setStatus({
//                     severity: "error",
//                     title: "Error",
//                     message: "Could not get current tab!",
//                 });
//                 return;
//             }
//             if (!tab.id) {
//                 return;
//             }
//
//             let selectedText: string;
//             try {
//                 const selectedTextInjected = await chrome.scripting.executeScript({
//                     target: { tabId: tab.id },
//                     func: () => window.getSelection()?.toString(),
//                 });
//                 selectedText = selectedTextInjected[0].result;
//             } catch (e) {
//                 selectedText = "";
//             }
//
//             let pageContent: string = "";
//             // try {
//             //     const pageContentInjected = await chrome.scripting.executeScript({
//             //         target: { tabId: tab.id },
//             //         func: () => window.document.body.innerHTML,
//             //     });
//             //     const tempDoc = document.implementation.createHTMLDocument();
//             //     tempDoc.body.innerHTML = pageContentInjected[0].result;
//             //     const reader = new Readability(tempDoc);
//             //     const parsed = reader.parse();
//             //     if (parsed) {
//             //         pageContent = turndown.turndown(parsed.content);
//             //     }
//             // } catch (e) {
//             //     // Nothing -- we'll just have no pageContent
//             // }
//
//             setUrl(tab.url ?? "");
//             setTitle(tab.title ?? "");
//             setSelection(selectedText);
//             setPageContent(pageContent);
//         }
//         handle();
//     }, []);
//
//
//     useEffect(() => {
//         if (!sandboxReady) {
//             return;
//         }
//
//         if(info.selectionText === '') {
//             setStatus({
//                 severity: "error",
//                 title: "Error",
//                 message: "No text selected!",
//             });
//             return;
//         }
//
//         async function handle() {
//             const preset = presets[selectedPreset];
//
//             const context = {
//                 page: {
//                     url: info.pageUrl,
//                     title: title,
//                     selectedText: info.selectionText,
//                     content: pageContent,
//                 },
//             };
//
//             if (overrideUrl) {
//                 setCompiledUrl(overrideUrl);
//                 setOverrideUrl(undefined);
//             } else {
//                 // const compiledUrl = await compileTemplate(preset.urlTemplate, context);
//
//                 setCompiledUrl("/periodic/daily");
//             }
//             const compiledContent = compileToMemo(typeof info.selectionText === "string" ? info.selectionText : "");
//
//             // setMethod(preset.method as OutputPreset["method"]);
//             // setMethod("PATCH");
//             setHeaders(preset.headers);
//             setCompiledContent(compiledContent);
//             setReady(true);
//         }
//
//         handle();
//     }, [
//         sandboxReady,
//         selectedPreset,
//         presets,
//         url,
//         title,
//         selection,
//         pageContent,
//     ]);
//
//     useEffect(() => {
//         if(!ready) {
//             return;
//         }
//
//         if(info.selectionText === '') {
//             setStatus({
//                 severity: "error",
//                 title: "Error",
//                 message: "No text selected!",
//             });
//             return;
//         }
//
//         const sendToObsidian = async () => {
//             const requestHeaders = {
//                 ...headers,
//                 "Content-Type": "text/markdown",
//             };
//             const request: RequestInit = {
//                 method: method,
//                 body: compiledContent,
//                 headers: requestHeaders,
//             };
//             const result = await obsidianRequest(
//                 apiKey,
//                 compiledUrl,
//                 request,
//                 insecureMode
//             );
//             const text = await result.text();
//
//             if (result.status < 300) {
//                 setStatus({
//                     severity: "success",
//                     title: "All done!",
//                     message: "Your content was sent to Obsidian successfully.",
//                 });
//                 setTimeout(() => window.close(), 2000);
//             } else {
//                 try {
//                     const body = JSON.parse(text);
//                     setStatus({
//                         severity: "error",
//                         title: "Error",
//                         message: `Could not send content to Obsidian: (Error Code ${body.errorCode}) ${body.message}`,
//                     });
//                 } catch (e) {
//                     setStatus({
//                         severity: "error",
//                         title: "Error",
//                         message: `Could not send content to Obsidian!: (Status Code ${result.status}) ${text}`,
//                     });
//                 }
//             }
//         };
//     }, [ready, compiledUrl, compiledContent, method, headers, insecureMode, apiKey]);
//
//     return (
//         <>
//         </>
//
//     )
// }


export const SendItCommand = async (commandId?: string) => {

    let syncSettings: ExtensionSyncSettings;
    let localSettings: ExtensionLocalSettings;
    let apiKey: string;
    let heading: string;
    let insecureMode: boolean = false;
    let obsidianUnavailable: boolean = false;
    let pageContent: string = "";
    let obsidianDailyNoteUnavailable: boolean = false;
    let title: string = "";
    let compiledUrl: string = "/periodic/daily";
    let method: string = "PATCH";
    let headers: { [key: string]: string } = {};
    let position: string =  "end";

    localSettings = await getLocalSettings(chrome.storage.local);

    try {
        localSettings = await getLocalSettings(chrome.storage.local);
        apiKey = localSettings.apiKey;
    } catch (e) {
        console.error(e);
        return;
    }

    try {
        localSettings = await getLocalSettings(chrome.storage.local);
        heading = localSettings.heading;
    } catch (e) {
        console.error(e);
        return;
    }

    try {
        const request = await obsidianRequest(
            apiKey,
            "/",
            { method: "get" },
            insecureMode
        );
        const result: StatusResponse = await request.json();
        obsidianUnavailable = !(result.status === "OK" &&
            result.service.includes("Obsidian Local REST API"));
    } catch (e) {
        obsidianUnavailable = true;
    }

    try {
        const request = await obsidianRequest(
            apiKey,
            "/periodic/daily",
            { method: "get" },
            insecureMode
        );
        obsidianDailyNoteUnavailable = !(request.statusText === "OK");
    } catch (e) {
        console.error(e);
        obsidianDailyNoteUnavailable = true;
    }

    if(obsidianDailyNoteUnavailable && !obsidianUnavailable) {
        try {
            const request = await obsidianRequest(
                apiKey,
                "/commands/daily-notes",
                { method: "post" },
                insecureMode
            );
            obsidianDailyNoteUnavailable = !(request.statusText === "OK");
        } catch (e) {
            console.error(e);
            obsidianDailyNoteUnavailable = true;
        }
    }

    let tab: chrome.tabs.Tab;
    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        tab = tabs[0];
    } catch (e) {
        console.error(e);
        return;
    }
    if (!tab?.id) {
        return;
    }

    let selectedText: string;
    try {
        const selectedTextInjected = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection()?.toString(),
        });
        selectedText = selectedTextInjected[0].result;
    } catch (e) {
        selectedText = "";
    }

    let compiledContent: string;
    if(commandId === "memos-page") {
        const replaceContent = localSettings.pageTemplate.replace(/{{page.title}}/g, <string>tab?.title).replace(/{{page.url}}/g, <string>tab?.url);
        compiledContent = compileToMemo(replaceContent);
    }else{
        const replaceContent = localSettings.selectionTemplate.replace(/{{selection}}/g, selectedText).replace(/{{page.title}}/g, <string>tab?.title).replace(/{{page.url}}/g, <string>tab?.url);
        compiledContent = compileToMemo(replaceContent);
    }

    if (compiledContent === "") {
        return;
    }

    const requestHeaders = {
        ...headers,
        "Content-Type": "text/markdown",
        "Content-Insertion-Position": position,
        Heading: heading,
    };
    const request: RequestInit = {
        method: method,
        body: compiledContent,
        headers: requestHeaders,
    };
    const result = await obsidianRequest(
        apiKey,
        compiledUrl,
        request,
        insecureMode
    );
    const text = await result.text();

    if (result.status < 300) {
        console.log("All done!");
    } else {
        try {
            const body = JSON.parse(text);
            console.log(body);
        } catch (e) {
            console.error(e);
        }
    }
}

const SendIt = async (info?:OnClickData) => {

    let syncSettings: ExtensionSyncSettings;
    let localSettings: ExtensionLocalSettings;
    let apiKey: string;
    let heading: string;
    let insecureMode: boolean = false;
    let obsidianUnavailable: boolean = false;
    let obsidianDailyNoteUnavailable: boolean = false;
    let pageContent: string = "";
    let title: string = "";
    let compiledUrl: string = "/periodic/daily";
    let obMethod: string = "PATCH";
    let headers: { [key: string]: string } = {};
    let position: string =  "end";

    localSettings = await getLocalSettings(chrome.storage.local);

    try {
        localSettings = await getLocalSettings(chrome.storage.local);
        apiKey = localSettings.apiKey;
    } catch (e) {
        console.error(e);
        return;
    }

    try {
        localSettings = await getLocalSettings(chrome.storage.local);
        heading = localSettings.heading;
    } catch (e) {
        console.error(e);
        return;
    }

    try {
        const request = await obsidianRequest(
            apiKey,
            "/",
            { method: "get" },
            insecureMode
        );
        const result: StatusResponse = await request.json();
        obsidianUnavailable = !(result.status === "OK" &&
            result.service.includes("Obsidian Local REST API"));
    } catch (e) {
        obsidianUnavailable = true;
    }

    try {
        const request = await obsidianRequest(
            apiKey,
            "/periodic/daily",
            { method: "get" },
            insecureMode
        );
        obsidianDailyNoteUnavailable = !(request.statusText === "OK");
    } catch (e) {
        console.error(e);
        obsidianDailyNoteUnavailable = true;
    }

    if(obsidianDailyNoteUnavailable && !obsidianUnavailable) {
        try {
            const request = await obsidianRequest(
                apiKey,
                "/commands/daily-notes",
                { method: "post" },
                insecureMode
            );
            obsidianDailyNoteUnavailable = !(request.statusText === "OK");
        } catch (e) {
            console.error(e);
            obsidianDailyNoteUnavailable = true;
        }
    }


    let tab: chrome.tabs.Tab;
    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        tab = tabs[0];
    } catch (e) {
        console.error(e);
        return;
    }
    if (!tab?.id) {
        return;
    }

    let selectedText: string;
    try {
        const selectedTextInjected = await chrome.scripting.executeScript({
            target: { tabId: tab?.id },
            func: () => window.getSelection()?.toString(),
        });
        selectedText = selectedTextInjected[0].result;
    } catch (e) {
        selectedText = "";
    }

    let compiledContent: string;
    try {

        if(info?.menuItemId === 'memos-selection-context-menu') {
            const replaceContent = localSettings.selectionTemplate.replace(/{{selection}}/g, selectedText).replace(/{{page.title}}/g, <string>tab?.title).replace(/{{page.url}}/g, <string>tab?.url);
            compiledContent = compileToMemo(replaceContent);
        } else{
            const replaceContent = localSettings.pageTemplate.replace(/{{page.title}}/g, <string>tab?.title).replace(/{{page.url}}/g, <string>tab?.url);
            compiledContent = compileToMemo(replaceContent);
        }
    } catch (e) {
        compiledContent = "";
    }

    if (compiledContent === "") {
        return;
    }

    const requestHeaders = {
        ...headers,
        "Content-Type": "text/markdown",
        "Content-Insertion-Position": position,
        Heading: heading,
    };
    const request: RequestInit = {
        method: obMethod,
        body: compiledContent,
        headers: requestHeaders,
    };
    const result = await obsidianRequest(
        apiKey,
        compiledUrl,
        request,
        insecureMode
    );
    const text = await result.text();

    if (result.status < 300) {
        console.log("All done!");
    } else {
        try {
            const body = JSON.parse(text);
        } catch (e) {
            console.error(e);
        }
    }
}

export default SendIt;
