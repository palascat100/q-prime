import * as React from 'react';
import { useState } from 'react';
import {
    Typography,
    Divider,
    Card,
    CardContent,
    Stack,
    FormControl,
    InputLabel,
    MenuItem,
    Box,
    Select,
    Input,
    TextField,
    Button
} from '@mui/material'

export default function AskQuestion(props) {
    const locations = ['Remote', 'GHC 4211', 'Honk\'s Closet'];
    const topics = ['Knock knock', 'Who\'s there?', 'Honk', 'Honk Who?', 'Honk you!'];
    
    const { questionValue, setQuestionValue, theme } = props

    const [location, setLocation] = useState('')
    const [topic, setTopic] = useState('')
    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%', background: theme.palette.background.paper}}>
                <CardContent>
                    <Typography fontSize={20} sx={{fontWeight: 'bold', textAlign: 'left'}}>Ask A Question</Typography>
                    
                    <Divider sx={{marginTop: ".5em", marginBottom:"1em"}}/>
                    <Stack direction="row" justifyContent="left">
                        <Box sx={{ minWidth: 120, width: "47%"}}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Location</InputLabel>
                                <Select
                                    labelId="location-select-label"
                                    id="location-select"
                                    value={location}
                                    label="Location"
                                    onChange={(e)=>setLocation(e.target.value)}
                                >
                                    {locations.map((loc) => <MenuItem value={loc} key={loc}>{loc}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ minWidth: 120, width: "47%", margin: "auto", marginRight: ".5em" }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Topic</InputLabel>
                                <Select
                                    labelId="topic-select-label"
                                    id="topic-select"
                                    value={topic}
                                    label="Topic"
                                    onChange={(e)=>setTopic(e.target.value)}
                                >
                                    {topics.map((top) => <MenuItem value={top} key={top}>{top}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                    <Typography fontSize={16} sx={{fontWeight: 'bold', textAlign: 'left', marginTop: "2em"}}>Question:</Typography>
                    <Input 
                        placeholder='Question (max 256 characters)'
                        onChange={(event)=>setQuestionValue(event.target.value)}
                        fullWidth
                        multiline
                        inputProps={{ maxLength: 256 }}
                    />
                    <Button fullWidth variant="contained" sx={{marginTop: "1em", alignContent: "center"}} 
                        onClick={()=>console.log(questionValue)}
                    >
                        Ask
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
