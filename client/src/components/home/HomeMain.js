import React, { useState } from 'react';
import QueueStats from './shared/QueueStats'

function SharedMain (props) {
    const { theme, queueData } = props;

    return (
      <div>
          <QueueStats 
            theme={theme}
            queueData={queueData}
          />
      </div>
    );
}
  
export default SharedMain;
