Component({
    properties: {
        propName: {
            type: String,
            value: 'val',
            observer: function(newVal, oldVal) {
            }
        }
    },

    data: {},
    attached: function () {},

    detached: function () {},

    methods: {
        onTap: function () {
            this.setData({
            });
        },
    }
});