import { Play } from 'lucide-react'

export default function MemberSpotlight() {
    const members = [
        { name: 'RM', album: 'Indigo', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFAHWP_9OiH9nenxFIgi6NV6OMIQEAdvIRxMWxHfzOCmbgWjIsoS-NZUN2MuRwgoC2-jQDoUaNkGbChjgIiBbKaK6PGEAkdwY334BmwjDMvIc3aiH92tTmL7UWt64_OwJOdZqzwtiocDFEim-J1pWHhMFwzKiT69zq5s_MQC9th2SYASsXjLEqg51IIIt4sIF9h9T-9Z7WImqH1QevGyVIGzOrVk23WEBrH_dNycU4eq2rXQurFeGiq1MfUjlG0fVClP6JxfVytBI' },
        { name: 'Jin', album: 'The Astronaut', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGzGtRqtFkNgqWrZxl4lf9fVwNHkm4dewf2qcNP47aQR_WdD90_vDzUwV6nnXWr9ne6-aTb9jMYfR3M4SciDFYVghD2CEGwPaKgXQ-xB0qAeiy8s-CTqXjc0hhCCUQdc93NZ2Yzn75S-fmddFtoc61eAxUUKOr8hyiCd2MXB5z9sQ8zsUBPRSnpVTI0jo9DbxZpdjvfllxjU_mGFr7-uxOaU97_Vk2Je0IJBgIizQQIKCFanX1BDvGfLez8Vv_Z12FgahDhMCPviI' },
        { name: 'SUGA', album: 'D-DAY', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe7F1ow-2ot9WezsO2q3RfX-RIRm8C_zjmu3jSYh2rFhNg2rW7s4WGUEqyNExUH_RsXJb0gXXxFIzG_JOngMQVSlOP4Ze0M0FSlvyMMa4dtRtG4p8PTNW5Q62SmG5ugYZZcuGWmOt0_3DC8u0yUh_2GDZhd786r_U-IeCHBp328Mro3TFMlkuHAW8rO8kNfiCoaQX0bxhtsUXLqcofaS7A3uk6LBQt1C9nzUP-32nN6QetJ5SYQ_Jf05_b35r4Zp7GVK-bqDSnS3s' },
        { name: 'j-hope', album: 'Jack In The Box', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfh4HI1NogXUuV4vAgnE0fTpNr-EbNvptrO8q2WVZ8NoJ35FValnuf_VZWqEIsT7s-0IMxteVFfCEQ30OwD_f0RPDvVEQpGrsmRiI1AwkJvN_Qq-2-AiSA-XAG7LalnuB4dIwuvktwQAK0QMXp6TJUtibY48ot3RuHNyofXpSI9VOIHr_rLZYKyR6XtkdSzXqnrevRU28E1hwvZlQzgDJLhusJRN7agtd1nfUGgmVohjUZ189nrEvViocjlhbXUJWO6AwMSOquITk' },
    ]

  return (
    <div className="col-span-1 md:col-span-3 lg:col-span-4 mt-8">
      <h3 className="text-2xl font-bold text-white mb-6 px-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">stars</span> Member Spotlight
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
        {members.map((member, idx) => (
            <div key={idx} className="snap-center min-w-[280px] h-[360px] rounded-2xl relative overflow-hidden group cursor-pointer flex-shrink-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                    style={{ backgroundImage: `url('${member.image}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                    <h4 className="text-3xl font-black text-white mb-1">{member.name}</h4>
                    <p className="text-gray-300 text-sm mb-4">{member.album}</p>
                    <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all">
                        <Play className="w-5 h-5 fill-current" /> Play Solo Mix
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}