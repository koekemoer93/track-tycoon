// src/tools/uploadTemplates.js
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const templates = {
  SyringaPark: {
    marshall: {
      monday: [
        { id: 'cones', title: 'Set up safety cones' },
        { id: 'radio', title: 'Test radio connection' },
      ],
    },
    cleaner: {
      monday: [
        { id: 'bins', title: 'Empty bins' },
        { id: 'bathroom', title: 'Clean bathrooms' },
      ],
    },
    mechanic: {
      monday: [
        { id: 'oil-check', title: 'Check engine oil' },
        { id: 'tyre-pressure', title: 'Check tyre pressure' },
      ],
    },
  },
};

export const uploadTemplatesToFirestore = async () => {
  for (const [trackId, roles] of Object.entries(templates)) {
    for (const [role, days] of Object.entries(roles)) {
      for (const [day, taskList] of Object.entries(days)) {
        const ref = doc(db, 'templates', `${trackId}_${role}_${day}`);
        await setDoc(ref, {
          trackId,
          role,
          day,
          tasks: taskList,
        });
        console.log(`✅ Uploaded ${trackId} / ${role} / ${day}`);
      }
    }
  }
};
