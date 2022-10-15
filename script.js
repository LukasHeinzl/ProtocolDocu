const dataTemplate = {
    meetingName: "Untitled",
    meetingDate: new Date().toLocaleDateString('de-DE'),
    startTime: null,
    endTime: null,
    paused: false,
    attendanceList: [], // array of strings containing the attendees names
    protocol: [] // array of objects of the following structure: {time: string, text: string, removable: boolean}
};

let meetingData;

function init(data) {
    meetingData = Object.assign({}, data);

    document.getElementById("meetingName").innerText = meetingData.meetingName;
    document.getElementById("meetingDate").innerText = meetingData.meetingDate;

    handleMeetingState();
    renderAttendanceList();
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
                    throw new Error("Validation failed");
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
    } else {
        meetingData.endTime = new Date().toLocaleTimeString();
    }

    handleMeetingState();
    //TODO: add protocol entry
}

function pauseResumeMeeting() {
    meetingData.paused = !meetingData.paused;
    handleMeetingState();
    //TODO: add protocol entry
}

function renameMeeting() {
    let newName = prompt("Enter the meeting name", meetingData.meetingName);

    if (newName) {
        meetingData.meetingName = newName;
        document.getElementById("meetingName").innerText = newName;
    }
}

function addAttendant() {
    let name = document.getElementById("attendantName");

    if (name.value.trim() === "") {
        return;
    }

    meetingData.attendanceList.push(name.value);
    name.value = "";
    renderAttendanceList();
}

function removeAttendant(i) {
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
        let removeBtn = document.createElement("button");

        nameBtn.innerText = entry;
        removeBtn.innerText = "X";
        removeBtn.onclick = () => removeAttendant(i);

        entryElem.append(nameBtn, removeBtn);
        list.append(entryElem);
    }
}