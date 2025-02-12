import React, {useState, useEffect, useMemo, useContext} from 'react';
import {
  Typography, Divider, CardContent, CardActions, Stack,
  FormControl, InputLabel, MenuItem, Box, Select, Input, Button,
} from '@mui/material';

import CooldownViolationOverlay from './CooldownViolationOverlay';
import BaseCard from '../../common/cards/BaseCard';

import HomeService from '../../../services/HomeService';
import {UserDataContext} from '../../../contexts/UserDataContext';
import {QueueDataContext} from '../../../contexts/QueueDataContext';
import {StudentDataContext} from '../../../contexts/StudentDataContext';

function createData(assignment_id, name) {
  return {assignment_id, name};
}

const date = new Date();

export default function AskQuestion() {
  const {userData} = useContext(UserDataContext);
  const {queueData} = useContext(QueueDataContext);

  // not changing name or andrewID to use global because this component can also be used by TAs to manually add questions
  const [name, setName] = useState('');
  const [andrewID, setAndrewID] = useState('');
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState(null);
  const [question, setQuestion] = useState('');

  const [showCooldownOverlay, setShowCooldownOverlay] = useState(false);
  const [timePassed, setTimePassed] = useState(0);

  const [askDisabled, setAskDisabled] = useState(false);

  const {studentData, setStudentData} = useContext(StudentDataContext);

  const locations = useMemo(() => {
    if (queueData != null) {
      const day = date.getDay();
      let newLocations = {};

      const dayDict = queueData.locations.dayDictionary;
      newLocations = dayDict;

      const roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : ['Office Hours'];

      if (roomsForDay.length === 1) {
        setLocation(roomsForDay[0]);
      }

      return roomsForDay;
    } else return [];
  }, [queueData.locations]);

  const topics = useMemo(() => {
    if (queueData != null) {
      const newRows = [];
      queueData.topics.forEach((topic) => {
        if (new Date(topic.start_date) <= new Date() && new Date(topic.end_date) > new Date()) {
          newRows.push(topic);
        }
      });
      newRows.push(createData(-1, 'Other'));

      if (newRows.length === 1) {
        setTopic(newRows[0]);
      }

      return newRows;
    } else return [createData(-1, 'Other')];
  }, [queueData.topics]);

  useEffect(() => {
    if (!userData.isTA) {
      setName(userData.preferredName);
      setAndrewID(userData.andrewID);
    }
  }, [userData.isTA, userData.preferredName, userData.andrewID]);

  function handleSubmit(event) {
    event.preventDefault();
    setAskDisabled(true);
    callAddQuestionAPI();
  }

  function callAddQuestionAPI() {
    HomeService.addQuestion(
        JSON.stringify({
          name: name,
          andrewID: andrewID,
          question: question,
          location: location,
          topic: topic,
        }),
    ).then((res) => {
      if (res.status === 200 && res.data.message === 'cooldown_violation') {
        setTimePassed(Math.round(res.data.timePassed));
        setShowCooldownOverlay(true);
      } else {
        clearValues();
      }

      setAskDisabled(false);
    });
  }

  function clearValues() {
    setName('');
    setAndrewID('');
    setLocation('');
    setTopic(null);
    setQuestion('');
  }

  return (
    <div>
      <BaseCard>
        <CardActions style={{justifyContent: 'space-between'}}>
          <Typography variant='h5' sx={{fontWeight: 'bold', ml: 2, my: 1}}>Ask A Question</Typography>
        </CardActions>
        <Divider></Divider>

        <CardContent sx={{mx: 1.5}}>
          <form onSubmit={handleSubmit}>
            {
              userData.isTA &&
                <Stack direction='row' justifyContent='left' sx={{mb: 2}}>
                  <Box sx={{minWidth: 120, width: '47%'}}>
                    <FormControl required fullWidth>
                      <Input
                        placeholder='Student Name'
                        onChange={(event) => setName(event.target.value)}
                        value={name}
                        fullWidth
                        inputProps={{maxLength: 30}}
                      />
                    </FormControl>
                  </Box>
                  <Box sx={{minWidth: 120, width: '47%', margin: 'auto', mr: 1}}>
                    <FormControl required fullWidth>
                      <Input
                        placeholder='Student Andrew ID'
                        onChange={(event) => setAndrewID(event.target.value)}
                        value={andrewID}
                        fullWidth
                        inputProps={{maxLength: 20}}
                      />
                    </FormControl>
                  </Box>
                </Stack>
            }
            <Stack direction='row' justifyContent='left'>
              <Box sx={{minWidth: 120, width: '47%'}}>
                <FormControl variant='standard' required fullWidth>
                  <InputLabel id='location-select'>Location</InputLabel>
                  <Select
                    labelId='location-select-label'
                    id='location-select'
                    value={location ?? ''}
                    label='Location'
                    onChange={(e)=>setLocation(e.target.value)}
                    style={{textAlign: 'left'}}
                  >
                    {locations.map((loc) => <MenuItem value={loc} key={loc}>{loc}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{minWidth: 120, width: '47%', margin: 'auto', mr: 1}}>
                <FormControl variant='standard' required fullWidth>
                  <InputLabel id='topic-select'>Topic</InputLabel>
                  <Select
                    labelId='topic-select-label'
                    id='topic-select'
                    value={topic ?? ''}
                    label='Topic'
                    onChange={(e)=>setTopic(e.target.value)}
                    style={{textAlign: 'left'}}
                  >
                    {topics.map((top) => <MenuItem value={top} key={top.assignment_id}>{top.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Typography variant='h6' sx={{fontWeight: 'bold', textAlign: 'left', mt: 2}}>Question:</Typography>
            <FormControl required fullWidth sx={{mt: 0.5}}>
              <Input
                placeholder='Question (max 256 characters)'
                onChange={(event) => setQuestion(event.target.value)}
                value={question ?? ''}
                fullWidth
                multiline
                inputProps={{maxLength: 256}}
                type='text'
              />
            </FormControl>
            <Button disabled={askDisabled} fullWidth variant='contained' sx={{mt: 3, py: 1, fontSize: '16px', fontWeight: 'bold', alignContent: 'center'}} type='submit'>
              Ask
            </Button>
          </form>
        </CardContent>
      </BaseCard>

      <CooldownViolationOverlay
        open={showCooldownOverlay}
        setOpen={setShowCooldownOverlay}
        timePassed={timePassed}
        andrewID={andrewID}
        question={question}
        location={location}
        topic={topic}
      />
    </div>
  );
}
