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
   * @name horizon.dashboard.container.images.actions.delete.service
   * @Description
   * restart container.
   */
  angular
    .module('horizon.dashboard.container.images.actions')
    .factory('horizon.dashboard.container.images.actions.delete.service', deleteService);

  deleteService.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.images.basePath',
    'horizon.dashboard.container.images.resourceType',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  function deleteService(
    zun, basePath, resourceType, actionResult, gettext, $qExtensions, modal, toast
  ) {
    var push = Array.prototype.push;
    var hosts = [{value: "", name: gettext("Select host to remove the image from.")}];
    // schema
    var schema = {
      type: "object",
      properties: {
        host: {
          title: gettext("Host"),
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
                key: 'host',
                type: "select",
                titleMap: hosts,
                required: true
              }
            ]
          }
        ]
      }
    ];

    // model
    var model;

    var message = {
      success: gettext('Container %s was successfully restarted.')
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
      // get hosts for zun
      zun.getHosts().then(onGetZunHosts);
      function onGetZunHosts(response) {
        var hs = [];
        response.data.items.forEach(function (host) {
          hs.push({value: host.id, name: host.hostname});
        });
        push.apply(hosts, hs);
      }
    }

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
    }

    function perform(selected) {
      model = {
        id: selected.id,
        repo: selected.repo,
        host: ""
      };

      // modal config
      var config = {
        "title": interpolate(gettext('Delete Image %s'), [model.repo]),
        "submitText": gettext('Delete'),
        "schema": schema,
        "form": form,
        "model": model
      };
      return modal.open(config).then(submit);

      function submit(context) {
        var id = context.model.id;
        var repo = context.model.repo;
        var host = context.model.host;
        return zun.deleteImage(id, host).then(function() {
          toast.add('success', interpolate(message.success, [repo]));
          var result = actionResult.getActionResult().updated(resourceType, id);
          return result.result;
        });
      }
    }
  }
})();
