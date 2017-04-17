// var data = {
//     id:0,
//     name:'root',
//     child_nodes: [
//         {
//             id:1,
//             name:'Node_1',
//             child_nodes: [
//                 {
//                     id:2,
//                     name:'Child_11',
//                     child_nodes: [
//                         {
//                             id:3,
//                             name:'Sub_111',
//                             child_nodes: [
//                                 {
//                                     id:4,
//                                     name:'SubSub_1111',
//                                     child_nodes: []
//                                 }
//                             ]
//                         }
//                     ]
//                 },
//                 {
//                     id:5,
//                     name:'Child_12',
//                     child_nodes: [
//                         {
//                             id:6,
//                             name:'Sub_121',
//                             child_nodes: []
//                         },
//                         {
//                             id:7,
//                             name:'Sub_122',
//                             child_nodes: []
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             id:8,
//             name:'Node_2',
//             child_nodes: []
//         }
//     ]
// };

function ServiceTree(etv_elem, localStorage) {
    this.localStorage_key = ServiceTree.localStorage_key;
    this.localStorage = localStorage;
    this.node_list_default  = {
        id:0,
        name:'root',
        child_nodes: []
    };
    
    var localStorage_node_list = this.localStorage.getItem(this.localStorage_key);
    if(localStorage_node_list === undefined || localStorage_node_list === null) {
        // this.node_list = Object.assign({}, this.node_list_default);
        this.node_list = JSON.parse(JSON.stringify(this.node_list_default));
        this.last_id = 0;

        this.set_default_storage_state();
    }
    else {
        var resp = JSON.parse(localStorage_node_list);
        this.node_list  = resp.node_list;
        this.last_id = resp.last_id;
        console.log("localStorage_node_list");
        console.log(this.node_list);
    }

    this.build(etv_elem);
}
ServiceTree.localStorage_key = 'node_list';

ServiceTree.prototype.build = function(etv){
    var self = this;
    etv.addEventListener("input", function(e) {
        // console.log(e);
        e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true);

        var cur_node = has_parent_attribute(e.target, 2, "data-node");
        if(cur_node)
        {
            var cur_node_id = cur_node.getAttribute("data-node");
            var resp = self.get_node(cur_node_id);
            if(resp) {
                resp.trg_node.name = e.target.value;
            }
        }
    }, false);

    etv.addEventListener("click", function(e) {
        console.log(e);
        e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true);

        var cur_node = has_parent_attribute(e.target, 2, "data-node");
        if(cur_node)
        {
            var cur_node_id = cur_node.getAttribute("data-node");

            var action = e.target.getAttribute("etv-action");
            switch(action) {
                case "addchild":
                    console.log("addchild");
                    var node_id = self.add_node('', cur_node_id);
                    if(node_id > -1) {
                        for(var i in cur_node.parentNode.childNodes) {
                            if(cur_node.parentNode.childNodes[i].tagName == 'UL') {
                                var li = self.create_dom_child('', node_id);
                                var ul = document.createElement('ul');
                                li.appendChild(ul);
                                cur_node.parentNode.childNodes[i].appendChild(li);
                                break;
                            }
                        }
                    }
                break;
                case "remove":
                    console.log("remove");
                    cur_node.parentNode.parentNode.removeChild(cur_node.parentNode);
                    self.remove_node(cur_node_id);
                break;
            }
        }
    }, false);
    
    etv.addEventListener("mouseover", function(e) {
        // console.log(e);
        e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true);

        var target;
        if(e.target.hasAttribute("data-node")){
            target = e.target;
        }
        else {
            target = has_parent_attribute(e.target, 2, "data-node");
        }

        if(target){
            var elem_lst = target.getElementsByClassName("etv-settings-hidden");
            // console.log([elem_lst]);
            for(var i=0;i<elem_lst.length;i++){
                var elem = elem_lst[i];
                elem.setAttribute("class", "etv-settings");
            }
        }
        var relatedTarget;
        if(e.relatedTarget.hasAttribute("data-node")){
            relatedTarget = e.relatedTarget;
        }
        else
        {
            relatedTarget = has_parent_attribute(e.relatedTarget, 2, "data-node");
        }

        if(relatedTarget) {
            if(target !== relatedTarget) {
                var elem_lst = relatedTarget.getElementsByClassName("etv-settings");
                for(var i=0;i<elem_lst.length;i++){
                    var elem = elem_lst[i];
                    elem.setAttribute("class", "etv-settings-hidden");
                }
            }
        }
    }, false);

    var ul = document.createElement('ul');
    var li = this.create_dom_child(this.node_list.name, this.node_list.id, true);
    
    var ul_1 = document.createElement('ul');
    ul_1.appendChild(this.create_dom_tree(this.node_list));
    li.appendChild(ul_1);

    ul.appendChild(li);

    etv.appendChild(ul);
}

ServiceTree.prototype.create_dom_settings = function(root) {
    var div_settings_wrap = document.createElement('span');
    div_settings_wrap.setAttribute("class", "etv-settings-hidden");
        if(root === undefined) {
            var div_settings_remove = document.createElement('div');
            div_settings_remove.setAttribute("class", "etv-settings-remove-i");
            div_settings_remove.setAttribute("etv-action", "remove");
        }


        var div_settings_addchild = document.createElement('div');
        div_settings_addchild.setAttribute("class", "etv-settings-right-i");
        div_settings_addchild.setAttribute("etv-action", "addchild");
    if(root === undefined) {
        div_settings_wrap.appendChild(div_settings_remove);
    }
    div_settings_wrap.appendChild(div_settings_addchild);

    return div_settings_wrap;
}

ServiceTree.prototype.create_dom_child = function(node_name, node_id, root) {
    var li = document.createElement('li');
    var div = document.createElement('div');
    div.setAttribute("data-node", node_id);
    var input = document.createElement('input');
    input.setAttribute("type", "text");
    input.setAttribute("value", node_name);
    input.setAttribute("placeholder", "укажите название");
    div.appendChild(input);

    div.appendChild(this.create_dom_settings(root));
    
    li.appendChild(div);
    return li;
}

ServiceTree.prototype.create_dom_tree = function(data) {
    var ul = document.createElement('ul');

    for (var i in data.child_nodes) {
        var node = data.child_nodes[i];
        var li = this.create_dom_child(node.name, node.id);

        var child_tree = this.create_dom_tree(node, node.id);
        if (child_tree) li.appendChild(child_tree);

        ul.appendChild(li);
    }

    return ul;
}

ServiceTree.prototype.add_node = function(node_name, parent_id) {
    if(parent_id>=0) {
        var resp = this.get_node(parent_id);
        if(resp) {
            var new_id = this.last_id + 1;
            resp.trg_node.child_nodes.push(
                {
                    id: new_id,
                    name: node_name,
                    child_nodes: []
                }
            );
            this.last_id = new_id;
            return new_id;
        }
    }
    return -1;
}

ServiceTree.prototype.remove_node = function(node_id) {
    if(node_id > 0) {
        var resp = this.get_node(node_id);
        if(resp) {
            return resp.parent_node.child_nodes.splice(resp.parent_node.child_nodes.indexOf(resp.trg_node), 1);
        }
    }
    return [];
}

ServiceTree.prototype.get_node = function(node_id, src_node, parent_node) {
    if(src_node === undefined) src_node = this.node_list;
    if(src_node.id == node_id) return { trg_node: src_node, parent_node: parent_node };

    for (var i in src_node.child_nodes) {
        var node = src_node.child_nodes[i];
        var ret = this.get_node(node_id, node, src_node);
        if(ret) return ret;
    }

    return null;
}

ServiceTree.prototype.save_state = function() {
    this.localStorage.setItem(this.localStorage_key, JSON.stringify({
        node_list: this.node_list,
        last_id: this.last_id
    }));
}

ServiceTree.prototype.set_default_storage_state = function() {
    this.localStorage.setItem(this.localStorage_key, JSON.stringify({
        node_list:this.node_list_default, 
        last_id:0
    }));
}





function has_parent_attribute(node, parent_level, attr_name) {
    if(node == null || node.parentElement == null || typeof attr_name != "string") return null;

    if(node.parentElement.hasAttribute(attr_name)) {
        return node.parentElement;
    }
    else if(parent_level > 0){
        return has_parent_attribute(node.parentElement, parent_level-1, attr_name)
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function(event) { 
    console.log('============= DOMContentLoaded ================');

    var etv = document.getElementById('etv');
    var service_tree = new ServiceTree(etv, localStorage);



    var etvClearBtn = document.getElementById('etvClearBtn');
    etvClearBtn.addEventListener("click", function(e) {
        service_tree.set_default_storage_state();
    }, false);


    var etvSaveBtn = document.getElementById('etvSaveBtn');
    etvSaveBtn.addEventListener("click", function(e) {
        service_tree.save_state();
    }, false);


    // console.log(service_tree.node_list);
    
}, false);

