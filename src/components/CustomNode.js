  // src/components/CustomNode.js
  import React from 'react';
  import { Handle } from 'reactflow';
  import styles from './CustomNode.module.css';

  function CustomNode({ id, data, onToggleTask }) {
    return (
      <div className={styles.customNode}>
        {/* Target Handle on the Left Side */}
        <Handle
          type="target"
          position="left"
          id={`target-${id}`}
          style={{ background: '#555' }}
        />
        
        <div className={styles.nodeContent}>
          <h3>{data.title}</h3>
          <p>{data.description}</p>
          {data.checklist && (
            <ul className={styles.checklist}>
              {data.checklist.map((task, index) => (
                <li key={index} className={task.completed ? styles.completed : ''}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(id, index)}
                  />
                  {task.task}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Source Handle on the Right Side */}
        <Handle
          type="source"
          position="right"
          id={`source-${id}`}
          style={{ background: '#555' }}
        />
      </div>
    );
  }

  export default CustomNode;