'use client'

import { useModal } from '@faceless-ui/modal'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { DocumentDrawerProps } from './types.js'

import { XIcon } from '../../icons/X/index.js'
import { useConfig } from '../../providers/Config/index.js'
import { RenderComponent } from '../../providers/Config/RenderComponent.js'
import { DocumentInfoProvider, useDocumentInfo } from '../../providers/DocumentInfo/index.js'
import { EditDepthProvider } from '../../providers/EditDepth/index.js'
import { useLocale } from '../../providers/Locale/index.js'
import { useTranslation } from '../../providers/Translation/index.js'
import { useRelatedCollections } from '../AddNewRelation/useRelatedCollections.js'
import { Gutter } from '../Gutter/index.js'
import { IDLabel } from '../IDLabel/index.js'
import { RenderTitle } from '../RenderTitle/index.js'
import { baseClass } from './index.js'

export const DocumentDrawerContent: React.FC<DocumentDrawerProps> = ({
  id: existingDocID,
  AfterFields,
  collectionSlug,
  drawerSlug,
  Header,
  onSave: onSaveFromProps,
}) => {
  const { config } = useConfig()

  const {
    routes: { api: apiRoute },
    serverURL,
  } = config

  const { closeModal, modalState, toggleModal } = useModal()
  const locale = useLocale()
  const { t } = useTranslation()
  const [docID, setDocID] = useState(existingDocID)
  const [isOpen, setIsOpen] = useState(false)
  const [collectionConfig] = useRelatedCollections(collectionSlug)

  const Edit = collectionConfig.admin.components.views.edit.default.Component

  const isEditing = Boolean(docID)
  const apiURL = docID
    ? `${serverURL}${apiRoute}/${collectionSlug}/${docID}${locale?.code ? `?locale=${locale.code}` : ''}`
    : null

  useEffect(() => {
    setIsOpen(Boolean(modalState[drawerSlug]?.isOpen))
  }, [modalState, drawerSlug])

  const onLoadError = React.useCallback(
    (data) => {
      if (isOpen) {
        closeModal(drawerSlug)
        toast.error(data.errors?.[0].message || t('error:unspecific'))
      }
    },
    [closeModal, drawerSlug, isOpen, t],
  )

  const onSave = useCallback<DocumentDrawerProps['onSave']>(
    (args) => {
      setDocID(args.doc.id)
      if (typeof onSaveFromProps === 'function') {
        void onSaveFromProps({
          ...args,
          collectionConfig,
        })
      }
    },
    [onSaveFromProps, collectionConfig],
  )

  return (
    <DocumentInfoProvider
      AfterFields={AfterFields}
      apiURL={apiURL}
      BeforeDocument={
        <Gutter className={`${baseClass}__header`}>
          <div className={`${baseClass}__header-content`}>
            <h2 className={`${baseClass}__header-text`}>
              {Header || <RenderTitle element="span" />}
            </h2>
            {/* TODO: the `button` HTML element breaks CSS transitions on the drawer for some reason...
            i.e. changing to a `div` element will fix the animation issue but will break accessibility
          */}
            <button
              aria-label={t('general:close')}
              className={`${baseClass}__header-close`}
              onClick={() => toggleModal(drawerSlug)}
              type="button"
            >
              <XIcon />
            </button>
          </div>
          <DocumentTitle />
        </Gutter>
      }
      collectionSlug={collectionConfig.slug}
      disableActions
      disableLeaveWithoutSaving
      id={docID}
      isEditing={isEditing}
      onLoadError={onLoadError}
      onSave={onSave}
    >
      <EditDepthProvider>
        <RenderComponent mappedComponent={Edit} />
      </EditDepthProvider>
    </DocumentInfoProvider>
  )
}

const DocumentTitle: React.FC = () => {
  const { id, title } = useDocumentInfo()
  return id && id !== title ? <IDLabel id={id.toString()} /> : null
}
