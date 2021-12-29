import React, { useMemo } from "react";
import { connect } from "react-redux";
import { t } from "ttag";
import _ from "underscore";

import Select from "metabase/components/Select";

import Databases from "metabase/entities/databases";

import Field from "metabase-lib/lib/metadata/Field";

type FieldObject = {
  id: number;
  display_name: string;
  fk_target_field_id?: number;
  table: {
    display_name: string;
  };
};

type StateProps = {
  IDFields: Field[];
};

type OwnProps = {
  field: {
    value: number | null;
    onChange: (e: { target: { value: number } }) => void;
  };
  formField: {
    databaseId: number;
  };
};

type Props = OwnProps & StateProps;

function getOptionValue(option: FieldObject) {
  return option.id;
}

function getOptionIcon(option: FieldObject) {
  return null;
}

function getFieldName(field: Field) {
  return field.displayName({ includeTable: true });
}

const SEARCH_PROPERTIES = [
  "display_name",
  "table.display_name",
  "table.schema_name",
];

function mapStateToProps(
  state: Record<string, unknown>,
  { formField }: OwnProps,
) {
  const { databaseId } = formField;
  return {
    IDFields: Databases.selectors.getIdfields(state, { databaseId }),
  };
}

function FKTargetPicker({ field, IDFields }: Props) {
  const { value, onChange } = field;

  const options = useMemo(
    () => _.sortBy(IDFields, field => getFieldName(field)),
    [IDFields],
  );

  return (
    <Select
      placeholder={t`Select a target`}
      value={value}
      options={options}
      onChange={onChange}
      searchable
      searchProp={SEARCH_PROPERTIES}
      optionValueFn={getOptionValue}
      optionNameFn={getFieldName}
      optionIconFn={getOptionIcon}
    />
  );
}

export default connect(mapStateToProps)(FKTargetPicker);