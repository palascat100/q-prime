import React, { useState, useEffect } from "react";

import BaseTable from "../../common/table/BaseTable";
import StudentEntry from "./StudentEntry";
import { Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import HomeService from "../../../services/HomeService";
import { socketSubscribeTo, socketUnsubscribeFrom } from "../../../services/SocketsService";
import { StudentStatusValues } from "../../../services/StudentStatus";

const FilterButton = () => {
    return (
        <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ mr: 1 }}
        >
            Filter
        </Button>
    )
};

export default function StudentEntries(props) {
    const { theme, queueData } = props;

    const [students, setStudents] = useState([]);
    const [isHelping, setIsHelping] = useState(false);
    const [helpIdx, setHelpIdx] = useState(-1); // idx of student that you are helping, only valid when isHelping is true

    function updateStudentFromSockets(res) {
        setStudents(students => {
            let ind = students.findIndex(p => (p.andrewID === res.andrewID));
            students[ind] = res.data.studentData;
            return [...students];
        });
        console.log(res.data.studentData);
    }



    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        HomeService.displayStudents().then(res => {
            setStudents(res.data);
        });

        socketSubscribeTo("add", (res) => {
            setStudents(students =>
                [...students.filter(p => p.andrewID !== res.studentData.andrewID), res.studentData]
            );
                
            new Notification("New Queue Entry", {
                "body": "Name: " + res.studentData.name + "\n" +
                "Andrew ID: " + res.studentData.andrewID + "\n" +
                "Topic: " + res.studentData.topic.name
            });
        });
            
        socketSubscribeTo("help", updateStudentFromSockets);
        socketSubscribeTo("unhelp", updateStudentFromSockets);
        socketSubscribeTo("updateQuestion", updateStudentFromSockets);
        socketSubscribeTo("updateQRequest", updateStudentFromSockets);
        socketSubscribeTo("message", updateStudentFromSockets);
        socketSubscribeTo("dismissMessage", updateStudentFromSockets);
        socketSubscribeTo("approveCooldown", updateStudentFromSockets);

        return () => {
            socketUnsubscribeFrom("add");
            socketUnsubscribeFrom("help");
            socketUnsubscribeFrom("unhelp");
            socketUnsubscribeFrom("updateQuestion");
            socketUnsubscribeFrom("updateQRequest");
            socketUnsubscribeFrom("message");
            socketUnsubscribeFrom("dismissMessage");
            socketUnsubscribeFrom("approveCooldown");
        };
    }, []);

    useEffect(() => {
        socketSubscribeTo("remove", (res) => {
            setStudents(students =>
                [...students.filter(p => p.andrewID !== res.andrewID)]
            );

            if (res.studentData.taAndrewID === queueData.andrewID) {
                setIsHelping(false);
                setHelpIdx(-1);
            }
        });

        return () => {
            socketUnsubscribeFrom("remove");
        };
    }, [queueData.andrewID]);

    useEffect(() => {
        for (let [index, student] of students.entries()) {
            if (student.status === StudentStatusValues.BEING_HELPED && student.taAndrewID === queueData.andrewID) {
                setHelpIdx(index);
                setIsHelping(true);
            }
        }
    }, [students, queueData]);

    const handleClickHelp = (index) => {
        HomeService.helpStudent(JSON.stringify({
            andrewID: students[index].andrewID
        })).then(res => {
            if (res.status === 200) {
                setHelpIdx(index);
                setIsHelping(true);
            }
        });
    }

    const handleCancel = (index) => {
        HomeService.unhelpStudent(JSON.stringify({
            andrewID: students[index].andrewID
        })).then(res => {
            if (res.status === 200) {
                setHelpIdx(-1);
                setIsHelping(false);
            }
        });
    }

    const removeStudent = (index) => {
        HomeService.removeStudent(JSON.stringify({
            andrewID: students[index].andrewID
        }));
    }

    const handleClickUnfreeze = (index) => {
        setIsHelping(false);
        setHelpIdx(-1);
        students[index].status = StudentStatusValues.WAITING;
    }

    return (
        <BaseTable title="Students" HeaderTailComp={FilterButton}>
            {
                students.map((student, index) => (
                    <StudentEntry
                        key={student.andrewID}
                        theme={theme}
                        student={student}
                        index={index}
                        isHelping={isHelping}
                        helpIdx={helpIdx}
                        handleClickHelp={handleClickHelp}
                        handleCancel={handleCancel}
                        removeStudent={removeStudent}
                        handleClickUnfreeze={handleClickUnfreeze}
                    />
                ))
            }
        </BaseTable>
    );
}
