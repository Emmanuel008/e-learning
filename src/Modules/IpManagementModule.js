import React from 'react';
import ModuleDetailLayout from './ModuleDetailLayout';

const stats = {
    progress: 0,
    videos: 5,
    questions: 18
  };

  const chapters = [
    {
      id: 'ip-1',
      number: 1,
      type: 'Book',
      title: 'Basics of Intellectual Property',
      progress: 0,
      sections: [
        {
          id: 'ip-1-s1',
          title: 'Why IP matters',
          description: 'How IP protects ideas and creates value.'
        },
        {
          id: 'ip-1-s2',
          title: 'Types of IP',
          description: 'Patents, trademarks, copyrights and trade secrets.'
        },
        {
          id: 'ip-1-s3',
          title: 'IP in research hubs',
          description: 'Ownership and collaboration considerations.'
        }
      ]
    },
    {
      id: 'ip-2',
      number: 2,
      type: 'Video',
      title: 'Protecting Ideas and Inventions',
      progress: 0,
      videos: [
        { id: 'ip-2-v1', title: 'From idea to patent filing', duration: '02:42', progress: 0 },
        { id: 'ip-2-v2', title: 'Common IP mistakes to avoid', duration: '03:24', progress: 0 }
      ]
    },
    {
      id: 'ip-3',
      number: 3,
      type: 'Video',
      title: 'IP Strategy for Innovation Hubs',
      progress: 0,
      videos: [
        { id: 'ip-3-v1', title: 'Aligning IP with hub strategy', duration: '02:19', progress: 0 },
        { id: 'ip-3-v2', title: 'Licensing and revenue models', duration: '03:13', progress: 0 }
      ]
    },
    {
      id: 'ip-4',
      number: 4,
      type: 'Quiz',
      title: 'IP Management Checkpoint',
      progress: 0,
      status: 'Start',
      questions: [
        {
          id: 'ip-4-q1',
          text: 'Which of the following is typically protected by a patent?',
          options: [
            { id: 'a', label: 'A brand name' },
            { id: 'b', label: 'An original invention or process' },
            { id: 'c', label: 'A logo design' }
          ],
          correctOptionId: 'b'
        },
        {
          id: 'ip-4-q2',
          text: 'Why should hubs think about IP early in a project?',
          options: [
            { id: 'a', label: 'To avoid any collaboration' },
            { id: 'b', label: 'To manage ownership and future commercialization' },
            { id: 'c', label: 'To make documentation harder' }
          ],
          correctOptionId: 'b'
        }
      ]
    }
  ];

export const ipManagementConfig = {
  slug: 'hmu08002',
  code: 'HMU08002',
  title: 'HMU08002 - Intellectual Property (IP) Management',
  subtitle: 'Understand and manage IP within your innovation hub.',
  stats,
  chapters
};

const IpManagementModule = () => {
  return (
    <ModuleDetailLayout
      code={ipManagementConfig.code}
      title={ipManagementConfig.title}
      subtitle={ipManagementConfig.subtitle}
      stats={ipManagementConfig.stats}
      chapters={ipManagementConfig.chapters}
    />
  );
};

export default IpManagementModule;

