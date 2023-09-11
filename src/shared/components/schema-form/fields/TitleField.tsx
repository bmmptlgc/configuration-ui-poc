import { FC } from 'react';
import { TitleFieldProps } from '@rjsf/utils/src/types';
import { Util } from 'shared/components/schema-form/helpers/SchemaHelpers';

const TitleField: FC<TitleFieldProps> = (props: TitleFieldProps) => {

  const toggleEditing = (parentId?: string) => {
    if (props.registry.formContext.toggleEditing) {
      props.registry.formContext.toggleEditing(parentId);
    }
  };

  const {title} = props;

  const titleId = props.id;
  const parentFieldId = titleId && titleId.split('__')[0];

  // Hide row names
  // if ((title && title.startsWith('row')) || (parentFieldId && parentFieldId.split('_').length === 4)) {
  if ((title && title.startsWith('row')) || (parentFieldId && Util.isNumeric(parentFieldId.split('_').pop() as string))) {
    return (
      <></>
    );
  }

  let cls: string = 'col-title';
  let titleHtml;

  // special formatting for root title i.e. form title
  if (parentFieldId === 'root' || !parentFieldId
    .split('_')
    .splice(1, parentFieldId.split('_').length - 2)
    .some(field => !field.startsWith('row'))) {
    cls += ' col-lg-12';
    titleHtml = (
      <div>
        <h5 id={titleId}>{title}</h5>
      </div>
    );
  } else {
    cls += ' col-lg-12';
    titleHtml = <h4 id={titleId}>{title}</h4>;
  }

  const readMode: boolean = props.registry.formContext && props.registry.formContext.readMode;
  const editingMode: boolean = props.registry.formContext && props.registry.formContext.editing
    && props.registry.formContext.editing.indexOf(parentFieldId) > -1;

  const editBtnCls: string = 'btn btn-sm' + (editingMode ? ' btn-primary' : '');

  return (
    <div>
      <div className="row" id="form-title">
        <div className={cls}>
          <div className="form-title">
            {titleHtml}
          </div>
        </div>
        {
          readMode && parentFieldId !== 'root' &&
            <div className="col-lg-6 text-right">
                <button type="button" className={editBtnCls} onClick={toggleEditing.bind(null, parentFieldId)}>
                    <span className="material-icons">
                      {editingMode ? 'done' : 'edit'}
                    </span>
                    <div className="ripple-container"/>
                </button>
            </div>
        }
      </div>
    </div>
  );
};

export default TitleField;