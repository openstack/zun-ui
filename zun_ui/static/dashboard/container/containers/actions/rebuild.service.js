/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngDoc factory
   * @name horizon.dashboard.container.containers.rebuild.service
   * @Description
   * rebuild container.
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.rebuild.service', rebuildService);

  rebuildService.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.basePath',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.validStates',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function rebuildService(
    $q, zun, adminActions, basePath, resourceType, validStates,
    actionResult, gettext, $qExtensions, modal, toast
  ) {
    var imageDrivers = [
      {value: "", name: gettext("Select image driver for changing image.")},
      {value: "docker", name: gettext("Docker Hub")},
      {value: "glance", name: gettext("Glance")}
    ];

    // model
    var model = {
      id: "",
      name: "",
      image: "",
      image_driver: ""
    };

    // schema
    var schema = {
      type: "object",
      properties: {
        image: {
          title: gettext("Image"),
          type: "string"
        },
        image_driver: {
          title: gettext("Image Driver"),
          type: "string"
        }
      }
    };

    // form
    var form = [
      {
        type: 'section',
        htmlClass: 'row',
        items: [
          {
            type: 'section',
            htmlClass: 'col-sm-12',
            items: [
              {
                "key": "image",
                "placeholder": gettext("Specify an image to change.")
              },
              {
                "key": "image_driver",
                "type": "select",
                "titleMap": imageDrivers,
                "condition": model.image !== ""
              }
            ]
          }
        ]
      }
    ];

    var message = {
      success: gettext('Container %s was successfully rebuilt.')
    };

    var service = {
      initAction: initAction,
      allowed: allowed,
      perform: perform
    };

    return service;

    //////////////

    // include this function in your service
    // if you plan to emit events to the parent controller
    function initAction() {
    }

    function allowed(container) {
      var adminAction = true;
      if (zun.isAdmin()) {
        adminAction = adminActions.indexOf("rebuild") >= 0;
      }
      return $q.all([
        $qExtensions.booleanAsPromise(adminAction),
        $qExtensions.booleanAsPromise(
          validStates.rebuild.indexOf(container.status) >= 0
        )
      ]);
    }

    function perform(selected) {
      model.id = selected.id;
      model.name = selected.name;
      // modal config
      var config = {
        "title": gettext('Rebuild Container'),
        "submitText": gettext('Rebuild'),
        "schema": schema,
        "form": form,
        "model": model
      };
      return modal.open(config).then(submit);

      function submit(context) {
        var id = context.model.id;
        var name = context.model.name;
        delete context.model.id;
        delete context.model.name;
        return zun.rebuildContainer(id, context.model).then(function() {
          toast.add('success', interpolate(message.success, [name]));
          var result = actionResult.getActionResult().updated(resourceType, id);
          return result.result;
        });
      }
    }
  }
})();
