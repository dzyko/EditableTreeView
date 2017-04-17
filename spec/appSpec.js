// require("jasmine-local-storage");

describe("ServiceTree", function() {

  beforeEach(function() {
    mockLocalStorage();
  });

  afterEach(function() {
    unmockLocalStorage();
  });



  describe("Проверка инициализации localStorage", function() {
    var service_tree;

    beforeEach(function() {
      
      // spyOn(localStorage, 'getItem');
      // spyOn(localStorage, 'setItem');
      service_tree = new ServiceTree(document.createElement('div'), localStorage);
    });

    it("Проверка вызова методов getItem и setItem у localStorage", function() {
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it("Проверка ключа при сохранении в localStorage", function() {
      expect(localStorage.getItem).toHaveBeenCalledWith(service_tree.localStorage_key);
      expect(localStorage.setItem).toHaveBeenCalledWith(service_tree.localStorage_key, JSON.stringify({
        node_list:service_tree.node_list_default, 
        last_id:0
      }));
    });

    it("localStorage проинициализирован значением по умолчанию", function() {
      var localStorage_node_list = localStorage.getItem(service_tree.localStorage_key);
      var resp = JSON.parse(localStorage_node_list);
      expect(JSON.stringify(resp.node_list)).toBe(JSON.stringify(service_tree.node_list_default));
      expect(resp.last_id).toBe(0);
    });

    it("Переменная node_list содержит копию значений по умолчанию", function() {
      expect(service_tree.node_list).not.toBe(service_tree.node_list_default);

      expect(JSON.stringify(service_tree.node_list)).toBe(JSON.stringify(service_tree.node_list_default));
    });
  });

  describe("Проверка метода get_node", function() {
    var service_tree;

    beforeEach(function() {
      var data = {
          id:0,
          name:'root',
          child_nodes: [
              {
                  id:1,
                  name:'Node_1',
                  child_nodes: [
                      {
                          id:2,
                          name:'Child_11',
                          child_nodes: [
                              {
                                  id:3,
                                  name:'Sub_111',
                                  child_nodes: [
                                      {
                                          id:4,
                                          name:'SubSub_1111',
                                          child_nodes: []
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          id:5,
                          name:'Child_12',
                          child_nodes: [
                              {
                                  id:6,
                                  name:'Sub_121',
                                  child_nodes: []
                              },
                              {
                                  id:7,
                                  name:'Sub_122',
                                  child_nodes: []
                              }
                          ]
                      }
                  ]
              },
              {
                  id:8,
                  name:'Node_2',
                  child_nodes: []
              }
          ]
      };
      

      localStorage.setItem(ServiceTree.localStorage_key, JSON.stringify({
          node_list:data, 
          last_id:8
      }));

      service_tree = new ServiceTree(document.createElement('div'), localStorage);
    });

    it("Получение корневого узла", function() {
      var resp = service_tree.get_node(service_tree.node_list.id);
      expect(resp.trg_node).toBe(service_tree.node_list);
      expect(resp.parent_node).toBe(undefined);

      resp = service_tree.get_node(service_tree.node_list.id, service_tree.node_list, undefined);
      expect(resp.trg_node).toBe(service_tree.node_list);
      expect(resp.parent_node).toBe(undefined);
    });

    it("Получение вложенного узла первой ветви дерева", function() {
      var resp = service_tree.get_node(service_tree.node_list.child_nodes[0].id);
      expect(resp.trg_node).toBe(service_tree.node_list.child_nodes[0]);
      expect(resp.parent_node).toBe(service_tree.node_list);
    });

    it("Получение вложенного узла второй ветви дерева", function() {
      var resp = service_tree.get_node(service_tree.node_list.child_nodes[0].child_nodes[1].id);
      expect(resp.trg_node).toBe(service_tree.node_list.child_nodes[0].child_nodes[1]);
      expect(resp.parent_node).toBe(service_tree.node_list.child_nodes[0]);
    });
  });



  describe("Проверка метода remove_node", function() {
    var service_tree;
    var data;

    beforeEach(function() {
      data = {
          id:0,
          name:'root',
          child_nodes: [
              {
                  id:1,
                  name:'Node_1',
                  child_nodes: [
                      {
                          id:2,
                          name:'Child_11',
                          child_nodes: [
                              {
                                  id:3,
                                  name:'Sub_111',
                                  child_nodes: [
                                      {
                                          id:4,
                                          name:'SubSub_1111',
                                          child_nodes: []
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          id:5,
                          name:'Child_12',
                          child_nodes: [
                              {
                                  id:6,
                                  name:'Sub_121',
                                  child_nodes: []
                              },
                              {
                                  id:7,
                                  name:'Sub_122',
                                  child_nodes: []
                              }
                          ]
                      }
                  ]
              },
              {
                  id:8,
                  name:'Node_2',
                  child_nodes: []
              }
          ]
      };
      

      localStorage.setItem(ServiceTree.localStorage_key, JSON.stringify({
          node_list:data, 
          last_id:8
      }));

      service_tree = new ServiceTree(document.createElement('div'), localStorage);
    });

    it("Попытка удаления корневого узла", function() {
      var resp = service_tree.remove_node(service_tree.node_list.id);
      expect(resp).toEqual([]);
      expect(service_tree.node_list).toEqual(data);
    });

    it("Удаление дочернего узла из первой ветви дерева", function() {
      var node_to_remove = JSON.parse(JSON.stringify(service_tree.node_list.child_nodes[0]));
      var resp = service_tree.remove_node(service_tree.node_list.child_nodes[0].id);
      expect(resp).toEqual([node_to_remove]);

      data.child_nodes.splice(0, 1);
      expect(service_tree.node_list).toEqual(data);
    });

    it("Удаление дочернего узла из второй ветви дерева", function() {
      var node_to_remove = JSON.parse(JSON.stringify(service_tree.node_list.child_nodes[1]));
      var resp = service_tree.remove_node(service_tree.node_list.child_nodes[1].id);
      expect(resp).toEqual([node_to_remove]);

      data.child_nodes.splice(1, 1);
      expect(service_tree.node_list).toEqual(data);
    });

  });



  describe("Проверка метода add_node", function() {
    var service_tree;

    beforeEach(function() {
      service_tree = new ServiceTree(document.createElement('div'), localStorage);
    });


    it("Добавление узла в корневой", function() {
      var node_name = "name123";
      var new_id = service_tree.add_node(node_name, service_tree.node_list.id);
      var last_index = service_tree.node_list.child_nodes.length-1;
      expect(service_tree.node_list.child_nodes[last_index]).toEqual(
      {
        id: new_id,
        name: node_name,
        child_nodes: []
      });
    });

    it("Добавление узла в не существующий узел", function() {
      var node_freezed = JSON.stringify(service_tree.node_list);
      
      var node_name = "name123";
      var new_id = service_tree.add_node(node_name, 123);
      expect(new_id).toBe(-1);
      expect(JSON.stringify(service_tree.node_list)).toBe(node_freezed);
    });

  });
  
});
