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
}

function loadMeeting() {

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