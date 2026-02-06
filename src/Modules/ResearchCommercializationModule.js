import React from 'react';
import ModuleDetailLayout from './ModuleDetailLayout';

const stats = {
    progress: 0,
    videos: 4,
    questions: 12
  };

  const chapters = [
    {
      id: 'rc-1',
      number: 1,
      type: 'Book',
      title: 'From Research to Market',
      progress: 0,
      sections: [
        {
          id: 'rc-1-s1',
          title: 'What is commercialization?',
          description: 'Understanding the journey from research outputs to products.'
        },
        {
          id: 'rc-1-s2',
          title: 'Identifying market needs',
          description: 'Matching research with real-world problems.'
        }
      ]
    },
    {
      id: 'rc-2',
      number: 2,
      type: 'Video',
      title: 'Commercialization Pathways',
      progress: 0,
      videos: [
        { id: 'rc-2-v1', title: 'Licensing to existing companies', duration: '02:42', progress: 0 },
        { id: 'rc-2-v2', title: 'Creating spin-offs and start-ups', duration: '03:24', progress: 0 }
      ]
    },
    {
      id: 'rc-3',
      number: 3,
      type: 'Video',
      title: 'Partnerships and Licensing',
      progress: 0,
      videos: [
        { id: 'rc-3-v1', title: 'Structuring partnerships', duration: '02:19', progress: 0 },
        { id: 'rc-3-v2', title: 'Key terms in licensing agreements', duration: '03:13', progress: 0 }
      ]
    },
    {
      id: 'rc-4',
      number: 4,
      type: 'Quiz',
      title: 'Commercialization Readiness Quiz',
      progress: 0,
      status: 'Start',
      questions: [
        {
          id: 'rc-4-q1',
          text: 'What is the main goal of research commercialization?',
          options: [
            { id: 'a', label: 'Publishing as many papers as possible' },
            { id: 'b', label: 'Turning research into real-world impact and value' },
            { id: 'c', label: 'Avoiding work with external partners' }
          ],
          correctOptionId: 'b'
        },
        {
          id: 'rc-4-q2',
          text: 'Which is a common pathway for commercialization?',
          options: [
            { id: 'a', label: 'Keeping all results confidential' },
            { id: 'b', label: 'Licensing IP to a company' },
            { id: 'c', label: 'Deleting raw data after experiments' }
          ],
          correctOptionId: 'b'
        }
      ]
    }
  ];

export const researchCommercializationConfig = {
  slug: 'hmu08003',
  code: 'HMU08003',
  title: 'HMU08003 - Research Commercialization',
  subtitle: 'Learn how to transform research outcomes into real-world solutions.',
  stats,
  chapters
};

const ResearchCommercializationModule = () => {
  return (
    <ModuleDetailLayout
      code={researchCommercializationConfig.code}
      title={researchCommercializationConfig.title}
      subtitle={researchCommercializationConfig.subtitle}
      stats={researchCommercializationConfig.stats}
      chapters={researchCommercializationConfig.chapters}
    />
  );
};

export default ResearchCommercializationModule;

