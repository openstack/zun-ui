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

  angular
    .module('horizon.dashboard.container.containers')
    .factory(
      'horizon.dashboard.container.containers.execute.service',
      executeContainerService);

  executeContainerService.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc factory
   * @name horizon.dashboard.container.containers.execute.service
   * @description
   * Service for the command execution in the container
   */
  function executeContainerService(
    zun, gettext, $qExtensions, modal, toast
  ) {
    // schema
    var schema = {
      type: "object",
      properties: {
        command: {
          title: gettext("Command"),
          type: "string"
        }
      }
    };

    // form
    var form = [
      {
        type: "section",
        htmlClass: "col-sm-12",
        items: [
          {
            key: "command",
            placeholder: gettext("The command to execute."),
            required: true
          }
        ]
      }
    ];

    // model
    var model;

    var message = {
      success: gettext("Command was successfully executed at container %s.")
    };

    var service = {
      initAction: initAction,
      perform: perform,
      allowed: allowed
    };

    return service;

    //////////////

    function initAction() {
    }

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
    }

    function perform(selected) {
      model = {
        id: selected.id,
        name: selected.name,
        command: ''
      };
      // modal config
      var config = {
        title: gettext("Execute Command"),
        submitText: gettext("Execute"),
        schema: schema,
        form: form,
        model: model
      };
      return modal.open(config).then(submit);
    }

    function submit(context) {
      var id = context.model.id;
      var name = context.model.name;
      delete context.model.id;
      delete context.model.name;
      return zun.executeContainer(id, context.model).then(function(response) {
        toast.add('success', interpolate(message.success, [name]));
      });
    }
  }
})();
