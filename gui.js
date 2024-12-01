Alpine.data('settings', () => ({
    color: null,
    shape: null,
    texture: null,
    season: null,
    init() {
      this.color = 1;
    },
}))

console.log(Alpine.data.settings);