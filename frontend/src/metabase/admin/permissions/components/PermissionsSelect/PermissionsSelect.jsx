import React, { useState, memo } from "react";
import PropTypes from "prop-types";

import PopoverWithTrigger from "metabase/components/PopoverWithTrigger";
import Toggle from "metabase/core/components/Toggle";
import Tooltip from "metabase/components/Tooltip";

import {
  PermissionsSelectOption,
  optionShape,
} from "./PermissionsSelectOption";

import {
  PermissionsSelectRoot,
  OptionsList,
  OptionsListItem,
  ActionsList,
  ToggleContainer,
  ToggleLabel,
  WarningIcon,
  DisabledPermissionOption,
  SelectedOption,
} from "./PermissionsSelect.styled";

const propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape(optionShape)).isRequired,
  actions: PropTypes.object,
  value: PropTypes.string.isRequired,
  toggleLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onAction: PropTypes.func,
  isDisabled: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  disabledTooltip: PropTypes.string,
  warning: PropTypes.string,
};

export const PermissionsSelect = memo(function PermissionsSelect({
  options,
  actions,
  value,
  toggleLabel,
  onChange,
  onAction,
  isDisabled,
  disabledTooltip,
  warning,
  isHighlighted,
}) {
  const [toggleState, setToggleState] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const selectableOptions = options.filter(option => option !== selectedOption);

  const selectedOptionValue = (
    <PermissionsSelectRoot
      isDisabled={isDisabled}
      aria-haspopup="listbox"
      data-testid="permissions-select"
    >
      {isDisabled ? (
        <DisabledPermissionOption
          {...selectedOption}
          isHighlighted={isHighlighted}
          hint={disabledTooltip}
          iconColor="text-light"
        />
      ) : (
        <SelectedOption {...selectedOption} />
      )}

      {warning && (
        <Tooltip tooltip={warning}>
          <WarningIcon />
        </Tooltip>
      )}
    </PermissionsSelectRoot>
  );

  const actionsForCurrentValue = actions?.[selectedOption?.value] || [];
  const hasActions = actionsForCurrentValue.length > 0;

  return (
    <PopoverWithTrigger
      disabled={isDisabled}
      triggerElement={selectedOptionValue}
      targetOffsetX={16}
      targetOffsetY={8}
    >
      {({ onClose }) => (
        <React.Fragment>
          <OptionsList role="listbox">
            {selectableOptions.map(option => (
              <OptionsListItem
                role="option"
                key={option.value}
                onClick={() => {
                  onClose();
                  onChange(option.value, toggleLabel ? toggleState : null);
                }}
              >
                <PermissionsSelectOption {...option} />
              </OptionsListItem>
            ))}
          </OptionsList>
          {hasActions && (
            <ActionsList>
              {actionsForCurrentValue.map((action, index) => (
                <OptionsListItem
                  key={index}
                  role="option"
                  onClick={() => {
                    onClose();
                    onAction(action);
                  }}
                >
                  <PermissionsSelectOption {...action} />
                </OptionsListItem>
              ))}
            </ActionsList>
          )}

          {toggleLabel && (
            <ToggleContainer>
              <ToggleLabel>{toggleLabel}</ToggleLabel>
              <Toggle small value={toggleState} onChange={setToggleState} />
            </ToggleContainer>
          )}
        </React.Fragment>
      )}
    </PopoverWithTrigger>
  );
});

PermissionsSelect.propTypes = propTypes;
