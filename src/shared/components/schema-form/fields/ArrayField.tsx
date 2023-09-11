import { Children, cloneElement, ComponentType, FC } from 'react';
import { JSONSchema7 } from 'json-schema';
import { ArrayFieldTemplateProps } from '@rjsf/utils';
import { ArrayFieldDescriptionProps, ArrayFieldTitleProps, TitleFieldProps } from '@rjsf/utils/src/types';
import DescriptionField from '@rjsf/core/src/components/templates/DescriptionField';
import TitleField from 'shared/components/schema-form/fields/TitleField';

interface ArrayFieldTitlePropsExtended extends ArrayFieldTitleProps {
  TitleField: ComponentType<TitleFieldProps>;
}

function ArrayFieldTitle({TitleField, idSchema, title, required, registry, schema}: ArrayFieldTitlePropsExtended) {
  if (!title) {
    return null;
  }

  const id = `${idSchema.$id}__title`;

  return <TitleField id={id} title={title} required={required} registry={registry} schema={schema}/>;
}

function ArrayFieldDescription({description, idSchema, schema, registry}: ArrayFieldDescriptionProps) {
  if (!description) {
    return null;
  }

  const id = `${idSchema.$id}__description`;

  return <DescriptionField id={id} description={description} schema={schema} registry={registry}/>;
}

const ArrayField: FC<ArrayFieldTemplateProps> = (props: ArrayFieldTemplateProps) => {

  const toggleEditing = (index: number) => {
    if (props.formContext.toggleEditing) {
      props.formContext.toggleEditing(props.idSchema.$id + '_' + index);
    }
  };

  let readMode: boolean = props.formContext && props.formContext.readMode;

  let addButtonCls = 'btn btn-secondary';

  if (readMode) {
    addButtonCls = 'btn btn-default-outline';
  }
  
  return (
    <fieldset className={props.className} id={props.idSchema.$id}>
      <ArrayFieldTitle
        key={`array-field-title-${props.idSchema.$id}`}
        // TitleField={props.registry.fields.TitleField as FC<{ id: string, title: string, required?: boolean }>}
        TitleField={props.registry.templates.TitleFieldTemplate}
        idSchema={props.idSchema}
        title={props.uiSchema!['ui:title'] || props.title}
        required={props.required}
        registry={props.registry}
        schema={props.schema}
      />
      {
        (props.uiSchema!['ui:description'] || props.schema.description) && (
          <ArrayFieldDescription
            key={`array-field-description-${props.idSchema.$id}`}
            idSchema={props.idSchema}
            description={
              props.uiSchema!['ui:description'] || props.schema.description
            }
            schema={props.schema}
            registry={props.registry}
          />
        )
      }
      {
        props.items && props.items.map((element) => {
          const childrenWithUiSchemas = Children.map(element.children, child =>
            cloneElement(child, {uiSchema: props.uiSchema})
          );

          let editingMode: boolean = props.formContext.editing &&
            props.formContext.editing.indexOf(`${props.idSchema.$id}_${element.index}`) > -1;

          let editBtnCls = 'btn btn-sm' + (editingMode ? ' btn-primary' : '');

          return (
            <div key={`${props.idSchema.$id}-${element.index}`} id={element.index.toString()}>
              <div className="row">
                <div className="col">
                  <h5>{element.children.props.schema && element.children.props.schema.title}</h5>
                </div>
                <div className="col text-right">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={element.onDropIndexClick(element.index)}
                  >
                    <span className="material-icons">delete</span>
                    <div className="ripple-container"/>
                  </button>
                  {readMode &&
                      <button
                          type="button"
                          className={editBtnCls}
                          onClick={toggleEditing.bind(null, element.index)}
                      >
                                        <span className="material-icons">
                                            {editingMode ? 'done' : 'edit'}
                                        </span>
                          <div className="ripple-container"/>
                      </button>}
                </div>
              </div>
              <div className="row">
                {childrenWithUiSchemas}
              </div>
              {readMode && element.index !== props.items.length - 1 && <hr/>}
            </div>
          );
        })
      }

      <div className="row">
        <div className="col">
          <div className="element-actions text-center">
            <button
              type="button"
              className={addButtonCls}
              onClick={props.onAddClick}
              data-target="#add-trust-modal"
            >
              Add {(props.schema.items as JSONSchema7).title}
              <div className="ripple-container"/>
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  );
};

export default ArrayField;