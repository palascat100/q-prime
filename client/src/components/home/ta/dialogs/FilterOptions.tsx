import React, {useState, useEffect, useContext, useMemo} from 'react';

import {List, ListSubheader, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Checkbox,
} from '@mui/material';

import SettingsService from '../../../../services/SettingsService';
import {QueueDataContext} from '../../../../contexts/QueueDataContext';

function createData(assignment_id, name) {
  return {assignment_id, name};
}

const date = new Date();

const FilterGroup = {
  Location: Symbol('location'),
  Topic: Symbol('Topic'),
};

export default function FilterOptions(props) {
  const {filteredLocations, filteredTopics, setFilteredLocations, setFilteredTopics} = props;

  const {queueData} = useContext(QueueDataContext);
  // group definition:
  // 0 = locations, 1 = topics
  const handleToggle = (group, value) => () => {
    const array = group === FilterGroup.Location ? filteredLocations : filteredTopics;
    const currentIndex = array.indexOf(value);
    const newChecked = group === FilterGroup.Location ? [...filteredLocations] : [...filteredTopics];

    if (currentIndex === -1) {
      // was unchecked previously
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    if (group === FilterGroup.Location) {
      setFilteredLocations(newChecked);
    } else {
      setFilteredTopics(newChecked);
    }
  };

  const topics = useMemo(() => {
    if (queueData != null) {
      const newRows = [];
      queueData.topics.forEach((topic) => {
        if (new Date(topic.start_date) <= new Date() && new Date(topic.end_date) > new Date()) {
          newRows.push(createData(
              topic.assignment_id,
              topic.name,
          ));
        }
      });
      newRows.push(createData(-1, 'Other'));
      return newRows;
    } else return [];
  }, [queueData.topics]);

  const locations = useMemo(() => {
    if (queueData != null) {
      const day = date.getDay();
      let newLocations = {};
      const dayDict = queueData.locations.dayDictionary;
      newLocations = dayDict;

      const roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : ['Office Hours'];
      return roomsForDay;
    } else return [];
  }, [queueData.locations]);

  return (
    <div>
      <List
        sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Locations
          </ListSubheader>
        }
      >
        {locations.map((value) => {
          const labelId = `checkbox-list-label-${value}`;

          return (
            <ListItem
              key={value}
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(FilterGroup.Location, value)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredLocations.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{'aria-labelledby': labelId}}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List
        sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
        component="nav"
        aria-labelledby="topics-list-subheader"
        subheader={
          <ListSubheader component="div" id="topics-list-subheader">
            Topics
          </ListSubheader>
        }
      >
        {topics.map((value) => {
          const labelId = `checkbox-list-label-${value.name}`;

          return (
            <ListItem
              key={value.name}
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(FilterGroup.Topic, value.name)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredTopics.indexOf(value.name) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{'aria-labelledby': labelId}}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value.name}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
