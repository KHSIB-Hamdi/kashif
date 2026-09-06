import React from 'react';
import { styled } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

const customIcons = {
  1: {
    icon: React.createElement(SentimentVeryDissatisfiedIcon, { color: "error" }),
    label: 'Very Dissatisfied',
  },
  2: {
    icon: React.createElement(SentimentDissatisfiedIcon, { color: "error" }),
    label: 'Dissatisfied',
  },
  3: {
    icon: React.createElement(SentimentSatisfiedIcon, { color: "warning" }),
    label: 'Neutral',
  },
  4: {
    icon: React.createElement(SentimentSatisfiedAltIcon, { color: "success" }),
    label: 'Satisfied',
  },
  5: {
    icon: React.createElement(SentimentVerySatisfiedIcon, { color: "success" }),
    label: 'Very Satisfied',
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  return React.createElement('span', other, customIcons[value].icon);
}

export default function RadioGroupRating({ value, onChange }) {
  return (
    <StyledRating
      name="highlight-selected-only"
      value={value}  // Controlled value from parent
      onChange={onChange}  // Pass onChange handler to capture rating changes
      IconContainerComponent={IconContainer}
      getLabelText={(value) => customIcons[value].label}
      highlightSelectedOnly
    />
  );
}
