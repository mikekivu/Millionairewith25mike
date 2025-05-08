export default function StatsSection() {
  const stats = [
    {
      value: "$12.4M+",
      label: "Total Investments",
    },
    {
      value: "8,500+",
      label: "Active Members",
    },
    {
      value: "$5.2M+",
      label: "Total Payouts",
    },
    {
      value: "12%",
      label: "Average Return",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition duration-300 transform hover:-translate-y-1"
            >
              <p className="text-primary text-4xl font-bold font-financial mb-2">{stat.value}</p>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
