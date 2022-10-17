const dataTemplate = {
    meetingName: "Untitled",
    meetingDate: new Date().toLocaleDateString('de-DE'),
    startTime: null,
    endTime: null,
    paused: false,
    attendanceList: [], // array of objects of the following structure: {name: string, currentlyAttending: boolean}
    protocol: [] // array of objects of the following structure: {time: string, who: string, text: string, highlight: boolean}
};

let meetingData;

function init(data) {
    meetingData = Object.assign({}, data);

    document.getElementById("meetingName").innerText = meetingData.meetingName;
    document.getElementById("meetingDate").innerText = meetingData.meetingDate;

    document.getElementById("highlightBtn").disabled = true;

    handleMeetingState();
    renderAttendanceList();
    renderProtocolList();
}

function saveMeeting() {
    let aElem = document.createElement("a");
    aElem.href = URL.createObjectURL(new Blob([JSON.stringify(meetingData)], {type: "application/json"}));
    aElem.download = meetingData.meetingName + ".json";
    aElem.click();
}

function loadMeeting() {
    let inputElem = document.createElement("input");
    inputElem.type = "file";
    inputElem.accept = "application/json";
    inputElem.onchange = e => {
        let reader = new FileReader();
        reader.readAsText(e.target.files[0]);
        reader.onload = rE => {
            let json = rE.target.result;

            try {
                json = JSON.parse(json);

                if (!validateDataObject(json)) {
                    alert("Invalid file supplied!");
                    return;
                }

                init(json);
            } catch (ex) {
                alert("Invalid file supplied!");
            }
        };
    };

    inputElem.click();
}

function validateDataObject(data) {
    for (let prop of Object.keys(dataTemplate)) {
        if (!data.hasOwnProperty(prop)) {
            return false;
        }
    }

    return true;
}

/**
 * This handles disabling and changing the button titles for start/end and pause/resume.
 */
function handleMeetingState() {
    let startEndBtn = document.getElementById("startEndBtn");
    let pauseResumeBtn = document.getElementById("pauseResumeBtn");

    startEndBtn.disabled = false;
    pauseResumeBtn.disabled = false;

    if (meetingData.startTime === null) {
        startEndBtn.innerText = "Start";
        pauseResumeBtn.disabled = true;
    } else if (meetingData.endTime === null) {
        startEndBtn.innerText = "End";

        if (meetingData.paused) {
            pauseResumeBtn.innerText = "Resume";
        } else {
            pauseResumeBtn.innerText = "Pause";
        }
    } else {
        startEndBtn.disabled = true;
        startEndBtn.innerText = "Meeting ended";
        pauseResumeBtn.disabled = true;
        pauseResumeBtn.innerText = "Pause";
    }
}

function startEndMeeting() {
    if (meetingData.startTime === null) {
        meetingData.startTime = new Date().toLocaleTimeString();
        addProtocolEntry(meetingData.startTime, "", "Meeting started", false);

        let attendeesFromTheStart = meetingData.attendanceList.filter(e => e.currentlyAttending).map(e => e.name).join(", ");
        addProtocolEntry(meetingData.startTime, "", "In attendance: " + attendeesFromTheStart, false);
    } else {
        meetingData.endTime = new Date().toLocaleTimeString();
        addProtocolEntry(meetingData.endTime, "", "Meeting ended", false);
    }

    handleMeetingState();
}

function pauseResumeMeeting() {
    meetingData.paused = !meetingData.paused;
    handleMeetingState();
    addProtocolEntry(new Date().toLocaleTimeString(), "", "Meeting " + (meetingData.paused ? "paused" : "resumed"), false);
}

function renameMeeting() {
    let newName = prompt("Enter the meeting name", meetingData.meetingName);

    if (newName) {
        meetingData.meetingName = newName;
        document.getElementById("meetingName").innerText = newName;
    }
}

function addProtocolEntry(time, who, text, highlight, checkCurrentEntry = true) {
    if (checkCurrentEntry) {
        saveCurrentEntry();
    }

    meetingData.protocol.push({time, who, text, highlight});
    renderProtocolList();
}

function renderProtocolList() {
    let list = document.getElementById("protocolList");
    list.innerHTML = "";

    for (let i = 0; i < meetingData.protocol.length; i++) {
        let entry = meetingData.protocol[i];
        let entryElem = document.createElement("li");
        let time = document.createElement("div");
        let who = document.createElement("div");
        let text = document.createElement("div");

        entryElem.onclick = () => selectEntry(entryElem);
        entryElem.setAttribute("pd-idx", i);

        if (entry.highlight) {
            entryElem.classList.add("highlighted");
        }

        time.innerText = entry.time;
        who.innerText = entry.who;
        text.innerText = entry.text;

        entryElem.append(time, who, text);
        list.append(entryElem);
    }
}

function addAttendant() {
    if (meetingData.endTime !== null) {
        return;
    }

    let name = document.getElementById("attendantName");

    if (name.value.trim() === "") {
        return;
    }

    meetingData.attendanceList.push({name: name.value, currentlyAttending: true});
    name.value = "";
    renderAttendanceList();
}

function removeAttendant(i) {
    if (meetingData.endTime !== null) {
        return;
    }

    meetingData.attendanceList.splice(i, 1);
    renderAttendanceList();
}

function renderAttendanceList() {
    let list = document.getElementById("attendanceList");
    list.innerHTML = "";

    for (let i = 0; i < meetingData.attendanceList.length; i++) {
        let entry = meetingData.attendanceList[i];
        let entryElem = document.createElement("div");
        let nameBtn = document.createElement("button");
        let attendingBtn = document.createElement("button");
        let removeBtn = document.createElement("button");

        nameBtn.innerText = entry.name;
        nameBtn.onclick = () => startNewProtocolEntry(entry.name);
        attendingBtn.innerHTML = "&#8676;";
        attendingBtn.onclick = () => changeAttendanceStatus(attendingBtn, entry);
        attendingBtn.classList.add("attendingBtn");
        removeBtn.innerText = "X";
        removeBtn.onclick = () => removeAttendant(i);

        entryElem.append(nameBtn, attendingBtn, removeBtn);
        list.append(entryElem);
    }
}

function changeAttendanceStatus(btn, entry) {
    if (meetingData.endTime !== null) {
        return;
    }

    entry.currentlyAttending = !entry.currentlyAttending;
    btn.innerHTML = entry.currentlyAttending ? "&#8676;" : "&#8677;";

    if (meetingData.startTime !== null) {
        let text = entry.currentlyAttending ? " is now attending." : " is no longer attending.";
        addProtocolEntry(new Date().toLocaleTimeString(), "", entry.name + text);
    }
}

function startNewProtocolEntry(who = "") {
    if (meetingData.endTime !== null) {
        return;
    }

    saveCurrentEntry();
    let entryElem = document.createElement("li");
    let timeElem = document.createElement("div");
    let whoElem = document.createElement("div");
    let textElem = document.createElement("textarea");

    entryElem.id = "currentEntry";
    entryElem.setAttribute("pd-highlight", "false");
    selectEntry(entryElem);

    timeElem.innerText = new Date().toLocaleTimeString();
    whoElem.innerText = who;
    textElem.setAttribute("aria-label", "Current protocol entry");
    textElem.rows = 10;

    entryElem.setAttribute("pd-time", timeElem.innerText);
    entryElem.setAttribute("pd-who", who);

    entryElem.append(timeElem, whoElem, textElem);
    document.getElementById("protocolList").append(entryElem);
    textElem.focus();
}

function saveCurrentEntry() {
    let entry = document.getElementById("currentEntry");

    if (entry === null) {
        return;
    }

    let time = entry.getAttribute("pd-time");
    let who = entry.getAttribute("pd-who");
    let text = entry.getElementsByTagName("textarea")[0].value;
    let highlight = entry.getAttribute("pd-highlight") === "true";
    addProtocolEntry(time, who, text, highlight, false);
    document.getElementById("highlightBtn").disabled = true;
}

function selectEntry(elem) {
    let entry = document.getElementById("currentEntry");

    if (entry !== null) {
        // cannot select another entry while one is being edited
        return;
    }

    let btn = document.getElementById("highlightBtn");
    btn.disabled = true;

    let currentSelectedEntry = document.querySelector(".selectedEntry");

    if (currentSelectedEntry !== null) {
        currentSelectedEntry.classList.remove("selectedEntry");
    }

    if (elem !== currentSelectedEntry) {
        elem.classList.add("selectedEntry");
        btn.disabled = false;

        let isCurrentlyHighlighted;

        if (elem.id === "currentEntry") {
            isCurrentlyHighlighted = elem.getAttribute("pd-highlight") === "true";
        } else {
            let idx = parseInt(elem.getAttribute("pd-idx"));
            let entry = meetingData.protocol[idx];
            isCurrentlyHighlighted = entry.highlight;
        }

        btn.innerText = isCurrentlyHighlighted ? "Remove highlight" : "Highlight";
    }
}

function toggleHighlight() {
    let currentSelectedEntry = document.querySelector(".selectedEntry");

    if (currentSelectedEntry === null) {
        return;
    }

    let isNowHighlighted;

    if (currentSelectedEntry.id === "currentEntry") {
        isNowHighlighted = currentSelectedEntry.getAttribute("pd-highlight") !== "true";
        currentSelectedEntry.setAttribute("pd-highlight", isNowHighlighted);
    } else {
        let idx = parseInt(currentSelectedEntry.getAttribute("pd-idx"));
        let entry = meetingData.protocol[idx];
        entry.highlight = !entry.highlight;
        isNowHighlighted = entry.highlight;
    }

    document.getElementById("highlightBtn").innerText = isNowHighlighted ? "Remove highlight" : "Highlight";

    if (isNowHighlighted) {
        currentSelectedEntry.classList.add("highlighted");
    } else {
        currentSelectedEntry.classList.remove("highlighted");
    }
}