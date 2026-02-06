import React from 'react';
import ModuleDetailLayout from './ModuleDetailLayout';

const stats = {
    progress: 0,
    videos: 5,
    questions: 16
  };

  const chapters = [
    {
      id: 'fr-1',
      number: 1,
      type: 'Book',
      title: 'Fundraising Basics for Hubs',
      progress: 0,
      sections: [
        {
          id: 'fr-1-s1',
          title: 'Sources of funding',
          description: 'Grants, donors, corporate partners and earned income.'
        },
        {
          id: 'fr-1-s2',
          title: 'Funding mix',
          description: 'Balancing short-term and long-term funding sources.'
        }
      ]
    },
    {
      id: 'fr-2',
      number: 2,
      type: 'Video',
      title: 'Building Sustainable Hub Operations',
      progress: 0,
      videos: [
        { id: 'fr-2-v1', title: 'Designing sustainable programs', duration: '02:42', progress: 0 },
        { id: 'fr-2-v2', title: 'Tracking costs and impact', duration: '03:24', progress: 0 }
      ]
    },
    {
      id: 'fr-3',
      number: 3,
      type: 'Video',
      title: 'Pitching and Donor Relationships',
      progress: 0,
      videos: [
        { id: 'fr-3-v1', title: 'Crafting your hub story', duration: '02:19', progress: 0 },
        { id: 'fr-3-v2', title: 'Stewarding long-term partners', duration: '03:13', progress: 0 }
      ]
    },
    {
      id: 'fr-4',
      number: 4,
      type: 'Quiz',
      title: 'Funding Strategy Quiz',
      progress: 0,
      status: 'Start',
      questions: [
        {
          id: 'fr-4-q1',
          text: 'Why is a diversified funding mix important?',
          options: [
            { id: 'a', label: 'To depend on a single donor' },
            { id: 'b', label: 'To reduce risk and increase resilience' },
            { id: 'c', label: 'To avoid reporting requirements' }
          ],
          correctOptionId: 'b'
        },
        {
          id: 'fr-4-q2',
          text: 'Which action helps build strong donor relationships?',
          options: [
            { id: 'a', label: 'Sharing clear impact updates regularly' },
            { id: 'b', label: 'Contacting donors only at renewal time' },
            { id: 'c', label: 'Keeping program data private' }
          ],
          correctOptionId: 'a'
        }
      ]
    }
  ];

export const fundraisingConfig = {
  slug: 'hmu08004',
  code: 'HMU08004',
  title: 'HMU08004 - Fundraising and Sustainable Hub Operations',
  subtitle: 'Plan for long-term sustainability and diversified funding.',
  stats,
  chapters
};

const FundraisingModule = () => {
  return (
    <ModuleDetailLayout
      code={fundraisingConfig.code}
      title={fundraisingConfig.title}
      subtitle={fundraisingConfig.subtitle}
      stats={fundraisingConfig.stats}
      chapters={fundraisingConfig.chapters}
    />
  );
};

export default FundraisingModule;

