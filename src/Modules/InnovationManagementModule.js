import React from 'react';
import ModuleDetailLayout from './ModuleDetailLayout';

const stats = {
    progress: 0,
    videos: 6,
    questions: 15
  };

  const chapters = [
    {
      id: 'im-1',
      number: 1,
      type: 'Book',
      title: 'Foundations of Innovation Management',
      progress: 0,
      sections: [
        {
          id: 'im-1-s1',
          title: 'What is innovation?',
          description: 'Definitions and key concepts for innovation in hubs.'
        },
        {
          id: 'im-1-s2',
          title: 'Types of innovation',
          description: 'Product, process and business model innovation.'
        },
        {
          id: 'im-1-s3',
          title: 'Innovation in your context',
          description: 'How these concepts apply to your hub.'
        }
      ]
    },
    {
      id: 'im-2',
      number: 2,
      type: 'Video',
      title: 'Innovation Processes and Frameworks',
      progress: 0,
      videos: [
        { id: 'im-2-v1', title: 'Stage-gate model overview', duration: '02:42', progress: 0 },
        { id: 'im-2-v2', title: 'Lean innovation in practice', duration: '03:24', progress: 0 },
        { id: 'im-2-v3', title: 'Case study: idea to pilot', duration: '02:19', progress: 0 }
      ]
    },
    {
      id: 'im-3',
      number: 3,
      type: 'Video',
      title: 'Building an Innovation Culture',
      progress: 0,
      videos: [
        { id: 'im-3-v1', title: 'Psychological safety in teams', duration: '03:13', progress: 0 },
        { id: 'im-3-v2', title: 'Incentives for experimentation', duration: '01:47', progress: 0 }
      ]
    },
    {
      id: 'im-4',
      number: 4,
      type: 'Quiz',
      title: 'Innovation Readiness Assessment',
      progress: 0,
      status: 'Start',
      questions: [
        {
          id: 'im-4-q1',
          text: 'Which statement best describes an innovation hub?',
          options: [
            { id: 'a', label: 'A place to file patents only' },
            { id: 'b', label: 'A space that connects people, ideas and resources' },
            { id: 'c', label: 'A traditional lecture room' }
          ],
          correctOptionId: 'b'
        },
        {
          id: 'im-4-q2',
          text: 'Which approach encourages small experiments and quick learning?',
          options: [
            { id: 'a', label: 'Waterfall planning' },
            { id: 'b', label: 'Lean innovation' },
            { id: 'c', label: 'Annual budgeting only' }
          ],
          correctOptionId: 'b'
        }
      ]
    }
  ];

export const innovationManagementConfig = {
  slug: 'hmu08001',
  code: 'HMU08001',
  title: 'HMU08001 - Innovation Management',
  subtitle: 'Introduction to innovation strategy and execution in hubs.',
  stats,
  chapters
};

const InnovationManagementModule = () => {
  return (
    <ModuleDetailLayout
      code={innovationManagementConfig.code}
      title={innovationManagementConfig.title}
      subtitle={innovationManagementConfig.subtitle}
      stats={innovationManagementConfig.stats}
      chapters={innovationManagementConfig.chapters}
    />
  );
};

export default InnovationManagementModule;

