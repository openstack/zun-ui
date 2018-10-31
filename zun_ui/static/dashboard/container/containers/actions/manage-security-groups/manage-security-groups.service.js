/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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
  "use strict";

  angular
    .module("horizon.dashboard.container.containers")
    .factory("horizon.dashboard.container.containers.manage-security-groups.service",
      manageSecurityGroup);

  manageSecurityGroup.$inject = [
    "$q",
    "horizon.app.core.openstack-service-api.neutron",
    "horizon.app.core.openstack-service-api.security-group",
    "horizon.app.core.openstack-service-api.zun",
    "horizon.dashboard.container.basePath",
    'horizon.dashboard.container.containers.adminActions',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.validStates',
    'horizon.framework.util.actions.action-result.service',
    "horizon.framework.util.i18n.gettext",
    "horizon.framework.util.q.extensions",
    "horizon.framework.widgets.form.ModalFormService",
    "horizon.framework.widgets.toast.service"
  ];

  function manageSecurityGroup(
    $q, neutron, securityGroup, zun, basePath, adminActions, resourceType, validStates,
    actionResult, gettext, $qExtensions, modal, toast
  ) {
    // title for dialog
    var title = gettext("Manage Security Groups: container %s");
    // schema
    var schema = {
      type: "object",
      properties: {
        signal: {
          title: gettext("Manage Security Groups"),
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
            type: "section",
            htmlClass: "col-xs-12",
            items: [
              {
                type: "template",
                /* eslint-disable max-len */
                templateUrl: basePath + "containers/actions/manage-security-groups/manage-security-groups.html"
              }
            ]
          }
        ]
      }
    ];

    // model
    var model = {};

    var message = {
      success: gettext("Changes security groups %(sgs)s for port %(port)s was successfully submitted.")
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

    function allowed(container) {
      var adminAction = true;
      if (zun.isAdmin()) {
        adminAction = adminActions.indexOf("manage_security_groups") >= 0;
      }
      return $q.all([
        $qExtensions.booleanAsPromise(adminAction),
        $qExtensions.booleanAsPromise(
          validStates.manage_security_groups.indexOf(container.status) >= 0
        )
      ]);
    }

    function perform(selected) {
      model.id = selected.id;
      model.name = selected.name;
      model.ports = [];
      Object.keys(selected.addresses).map(function(key) {
        selected.addresses[key].forEach(function (addr) {
          model.ports.push(addr.port);
        });
      });
      model.port_security_groups = [];

      // modal config
      var config = {
        "title": interpolate(title, [model.name]),
        "submitText": gettext("Submit"),
        "schema": schema,
        "form": form,
        "model": model
      };
      return modal.open(config).then(submit);
    }

    function submit(context) {
      var id = context.model.id;
      var portSgs = context.model.port_security_groups;
      var aggregatedPortSgs = {};
      // initialize port list
      model.ports.forEach(function (port) {
        aggregatedPortSgs[port] = [];
      });
      // add security groups for each port
      portSgs.forEach(function (portSg) {
        aggregatedPortSgs[portSg.port].push(portSg.security_group);
      });

      Object.keys(aggregatedPortSgs).map(function (port) {
        return zun.updatePortSecurityGroup(id, port, aggregatedPortSgs[port]).then(function() {
          var sgs = gettext("(empty)");
          if (aggregatedPortSgs[port].length) {
            sgs = aggregatedPortSgs[port];
          }
          toast.add(
            'success',
            interpolate(message.success, {port: port, sgs: sgs}, true));
          var result = actionResult.getActionResult().updated(resourceType, id);
          return result.result;
        });
      });
    }
  }
})();
