import api from "@/api/api";
export default {
  methods: {
    // 根据sku查询对应平台的条码编码
    getBarcodeBeSku(list, options = { sku: 'goodsSku' }) {
      return new Promise((resolve) => {
        let skuList = Array.from(new Set(list.map((k) => k[options.sku])));
        this.ajaxData({
          url: api.get_querySkuScanCodes,
          type: "POST",
          data: skuList,
        })
          .then((response) => {
            if (response.data.code === 0) {
              let resList = response.data.datas || [];
              let obj = {};
              resList.forEach((k) => (obj[k.sku] = k));
              list.forEach((n, i) => {
                if (obj[n[options.sku]] && obj[n[options.sku]].scanCodeList) {
                  n.barCode = obj[n[options.sku]].scanCodeList.join(",");
                }
              });
              resolve(obj);
            } else {
              resolve({});
            }
          })
          .catch(() => {
            resolve({});
          });
      });
    },
  },
}