export default function Stats() {
  const stats = [
    { label: 'Active Users', value: '18,500+' },
    { label: 'Total Invested', value: '$16.8M+' },
    { label: 'Total Payouts', value: '$4.2M+' },
    { label: 'Countries', value: '45+' },
  ];

  return (
    <section className="bg-primary-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-primary-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
